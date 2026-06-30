import tempfile
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq
from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from app.core.settings import Settings


def make_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    settings = Settings(
        metadata_url=f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}",
        result_store_path=str(Path(temp_dir.name) / "results"),
    )
    store = SQLiteMetadataStore(settings.metadata_url)
    app = create_app(store, settings)
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def create_source_dataset(client: TestClient, name: str = "source_product_health_reviews") -> dict:
    response = client.post(
        "/api/source-datasets",
        json={
            "connection_id": "conn_product_health_csv",
            "connection_name": "Product Health CSV Connection",
            "connection_type": "csv",
            "name": name,
            "raw_scope": f"/data/incoming/{name}.csv",
            "resource_label": "file_path",
            "schema_preview": [
                {"name": "review_id", "type": "string"},
                {"name": "product_id", "type": "string"},
                {"name": "rating", "type": "number"},
            ],
        },
    )
    assert response.status_code == 201
    return response.json()


def write_parquet(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pq.write_table(pa.Table.from_pylist(rows), path)


def create_target_dataset(client: TestClient) -> dict:
    source_dataset = create_source_dataset(client)
    response = client.post(
        "/api/target-datasets",
        json={
            "name": "dataset_product_health_gold",
            "description": "제품 상태 분석용 gold dataset draft",
            "source_dataset_id": source_dataset["id"],
            "source_dataset_name": source_dataset["name"],
            "source_type": source_dataset["connection_type"],
            "selected_fields": ["review_id", "product_id", "rating"],
            "process_rule": {
                "type": "select_fields",
                "selected_fields": ["review_id", "product_id", "rating"],
            },
            "schedule": {"mode": "manual", "note": "데모에서는 수동 실행으로만 준비합니다."},
            "output_schema": [
                {"name": "review_id", "type": "string"},
                {"name": "product_id", "type": "string"},
                {"name": "rating", "type": "number"},
            ],
        },
    )
    assert response.status_code == 201
    return response.json()


def test_target_dataset_run_handoff_creates_week2_run_link() -> None:
    client = make_client()
    target_dataset = create_target_dataset(client)

    response = client.post(
        f"/api/target-datasets/{target_dataset['id']}/runs",
        json={"executor": "local_runner", "triggered_by": "demo_user"},
    )

    assert response.status_code == 201
    run_record = response.json()
    assert run_record["id"]
    assert run_record["target_dataset_id"] == target_dataset["id"]
    assert run_record["target_dataset_name"] == "dataset_product_health_gold"
    assert run_record["week2_run_id"] == "run_reviews_demo_001"
    assert run_record["pipeline_id"] == "pipeline_reviews_json_e2e"
    assert run_record["executor"] == "local_runner"
    assert run_record["status"] == "fallback_succeeded"
    assert run_record["job_definition"]["target_dataset_id"] == target_dataset["id"]
    assert run_record["execution_result"]["contract"] == "ExecutionResult"
    assert run_record["execution_result"]["run_id"] == "run_reviews_demo_001"
    assert run_record["execution_result"]["target_dataset_handoff"] == {
        "target_dataset_id": target_dataset["id"],
        "target_dataset_name": "dataset_product_health_gold",
        "job_definition_status": "draft",
        "source_dataset_id": target_dataset["source_dataset_id"],
        "source_mappings": [],
        "selected_fields": ["review_id", "product_id", "rating"],
        "process_rule": {
            "type": "select_fields",
            "selected_fields": ["review_id", "product_id", "rating"],
        },
        "schedule": {"mode": "manual", "note": "데모에서는 수동 실행으로만 준비합니다."},
        "output_schema": [
            {"name": "review_id", "type": "string"},
            {"name": "product_id", "type": "string"},
            {"name": "rating", "type": "number"},
        ],
        "runtime_output_scope": "week2_fixture_output",
        "runtime_output_dataset_id": "dataset_reviews_gold",
        "runtime_pipeline_id": "pipeline_reviews_json_e2e",
    }
    assert run_record["execution_result"]["outputs"][0]["dataset_id"] == "dataset_reviews_gold"
    assert "product_health_manual_run_contract" not in run_record["execution_result"]

    list_response = client.get(f"/api/target-datasets/{target_dataset['id']}/runs")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == run_record["id"]
    assert list_response.json()[0]["execution_result"]["target_dataset_handoff"]["runtime_output_scope"] == "week2_fixture_output"

    detail_response = client.get(f"/api/target-dataset-runs/{run_record['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["week2_run_id"] == "run_reviews_demo_001"

    week2_response = client.get("/api/week2/runs/run_reviews_demo_001")
    assert week2_response.status_code == 200
    assert week2_response.json()["status"] == "fallback_succeeded"


def test_target_dataset_run_handoff_requires_existing_target_dataset() -> None:
    client = make_client()

    response = client.post(
        "/api/target-datasets/missing-target/runs",
        json={"executor": "local_runner", "triggered_by": "demo_user"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Target dataset not found"


def test_target_dataset_run_handoff_rejects_invalid_executor() -> None:
    client = make_client()
    target_dataset = create_target_dataset(client)

    response = client.post(
        f"/api/target-datasets/{target_dataset['id']}/runs",
        json={"executor": "unknown_runner", "triggered_by": "demo_user"},
    )

    assert response.status_code == 422


def test_product_health_target_dataset_run_fails_without_source_snapshots() -> None:
    client = make_client()
    source_dataset = create_source_dataset(client)
    source_mapping = {
        "role": "reviews",
        "source_id": "source_reviews_seed",
        "source_dataset_id": source_dataset["id"],
        "source_dataset_name": source_dataset["name"],
        "source_type": source_dataset["connection_type"],
        "required_fields": ["product_id", "rating"],
        "optional_fields": ["review_id", "review_time"],
        "produces_metrics": ["review_count", "average_rating", "negative_review_rate"],
    }
    target_response = client.post(
        "/api/target-datasets",
        json={
            "name": "dataset_product_health_gold",
            "description": "제품 상태 분석용 gold dataset draft",
            "source_dataset_id": source_dataset["id"],
            "source_dataset_name": source_dataset["name"],
            "source_type": source_dataset["connection_type"],
            "source_mappings": [source_mapping],
            "selected_fields": ["product_id", "rating"],
            "process_rule": {
                "type": "product_health_gold_pipeline",
                "mode": "recommended_template",
                "input_kind": "raw_sources",
                "template_id": "product_health_recommended_v1",
                "template_version": "transform_product_health_gold_v1",
                "final_output": {
                    "dataset_id": "dataset_product_health_gold",
                    "query_table": "gold_product_health",
                    "layer": "gold",
                    "user_facing": True,
                },
                "source_mappings": [source_mapping],
                "steps": [
                    {"id": "read_reviews", "phase": "bronze", "operation_type": "source"},
                    {"id": "load_product_health_gold", "phase": "load", "operation_type": "load"},
                ],
                "quality_rules": [
                    {"id": "row_count_nonzero", "type": "row_count_min", "severity": "blocking"},
                    {"id": "risk_score_range", "type": "range", "field": "risk_score", "severity": "blocking"},
                ],
            },
            "schedule": {"mode": "manual"},
            "output_schema": [
                {"name": "product_id", "type": "string"},
                {"name": "risk_score", "type": "number"},
            ],
        },
    )
    assert target_response.status_code == 201
    target_dataset = target_response.json()

    response = client.post(
        f"/api/target-datasets/{target_dataset['id']}/runs",
        json={"executor": "local_runner", "triggered_by": "demo_user"},
    )

    assert response.status_code == 201
    run_record = response.json()
    contract = run_record["execution_result"]["product_health_manual_run_contract"]
    assert contract["contract_version"] == "product_health_manual_run_result_v1"
    assert run_record["status"] == "failed"
    assert run_record["execution_result"]["target_dataset_handoff"]["runtime_output_scope"] == "product_health_gold_output_failed"
    assert contract["status"] == "failed_product_health_execution"
    assert contract["target_dataset"]["dataset_id"] == "dataset_product_health_gold"
    assert contract["target_dataset"]["query_table"] == "gold_product_health"
    assert contract["source_snapshot_inputs"] == [
        {
            "source_dataset_id": source_dataset["id"],
            "source_dataset_name": source_dataset["name"],
            "source_type": "csv",
            "role": "reviews",
            "source_id": "source_reviews_seed",
            "required_snapshot_contract": "source_snapshot_artifact_v1",
            "snapshot_lookup": "latest_successful_by_source_dataset_id",
            "snapshot_status": "missing_source_snapshot",
            "artifact_uri": None,
            "format": "parquet",
            "row_count": None,
            "bytes": None,
            "schema": [],
        }
    ]
    assert contract["gold_output"]["dataset_id"] == "dataset_product_health_gold"
    assert contract["gold_output"]["query_table"] == "gold_product_health"
    assert contract["gold_output"]["format"] == "parquet"
    assert contract["gold_output"]["status"] == "failed_product_health_execution"
    assert contract["gold_output"]["storage_uri"] is None
    assert contract["gold_output"]["schema_version"] == "schema_product_health_gold_v2"
    assert contract["gold_output"]["contract_version"] == "product_health_gold_contract_v2"
    assert any(field["name"] == "risk_score" for field in contract["gold_output"]["schema"])
    assert any(field["name"] == "synthetic_product_id" for field in contract["gold_output"]["schema"])
    assert all(result["status"] == "skipped" for result in contract["quality_results"])
    assert contract["lineage"]["input_source_dataset_ids"] == [source_dataset["id"]]
    assert contract["lineage"]["output_dataset_id"] == "dataset_product_health_gold"
    assert contract["catalog_payload"]["dataset_id"] == "dataset_product_health_gold"
    assert contract["catalog_payload"]["table_name"] == "gold_product_health"
    assert contract["catalog_payload"]["storage_uri"] is None
    assert contract["catalog_payload"]["query"]["table_name"] == "gold_product_health"
    assert "risk_score" in contract["catalog_payload"]["query"]["allowed_columns"]
    assert "synthetic_product_id" in contract["catalog_payload"]["query"]["allowed_columns"]
    assert contract["error"]["code"] == "MISSING_SOURCE_SNAPSHOT"
    assert contract["error"]["missing_roles"] == ["reviews"]


def test_product_health_target_dataset_run_executes_from_source_snapshots() -> None:
    client = make_client()
    temp_dir = Path(client.app.state.test_temp_dir.name)
    source_specs = [
        ("reviews", "source_reviews_seed", "source_product_health_reviews"),
        ("behavior", "source_behavior_events_seed", "source_product_health_behavior"),
        ("delivery", "source_delivery_trips_seed", "source_product_health_delivery"),
        ("product_master", "source_product_master_seed", "source_product_health_product_master"),
    ]
    sources = {role: create_source_dataset(client, name) for role, _, name in source_specs}
    source_mappings = [
        {
            "role": role,
            "source_id": source_id,
            "source_dataset_id": sources[role]["id"],
            "source_dataset_name": sources[role]["name"],
            "source_type": sources[role]["connection_type"],
            "required_fields": ["product_id"],
            "optional_fields": [],
            "produces_metrics": [],
        }
        for role, source_id, _ in source_specs
    ]
    target_response = client.post(
        "/api/target-datasets",
        json={
            "name": "dataset_product_health_gold",
            "description": "제품 상태 분석용 gold dataset draft",
            "source_dataset_id": sources["reviews"]["id"],
            "source_dataset_name": sources["reviews"]["name"],
            "source_type": sources["reviews"]["connection_type"],
            "source_mappings": source_mappings,
            "selected_fields": ["product_id"],
            "process_rule": {
                "type": "product_health_gold_pipeline",
                "mode": "recommended_template",
                "input_kind": "raw_sources",
                "template_id": "product_health_recommended_v1",
                "template_version": "transform_product_health_gold_v2",
                "final_output": {
                    "dataset_id": "dataset_product_health_gold",
                    "query_table": "gold_product_health",
                    "layer": "gold",
                    "user_facing": True,
                },
                "source_mappings": source_mappings,
                "steps": [
                    {"id": "read_reviews", "phase": "bronze", "operation_type": "source"},
                    {"id": "aggregate_review_health", "phase": "aggregate", "operation_type": "aggregate"},
                    {"id": "load_product_health_gold", "phase": "load", "operation_type": "load"},
                ],
                "quality_rules": [
                    {"id": "schema_match", "type": "schema_match", "severity": "blocking"},
                    {"id": "row_count_nonzero", "type": "row_count_min", "severity": "blocking"},
                    {"id": "risk_score_range", "type": "range", "field": "risk_score", "severity": "blocking"},
                    {"id": "zero_denominator_policy", "type": "semantic_rule", "severity": "blocking"},
                ],
            },
            "schedule": {"mode": "manual"},
            "output_schema": [
                {"name": "product_id", "type": "string"},
                {"name": "risk_score", "type": "number"},
            ],
        },
    )
    assert target_response.status_code == 201
    target_dataset = target_response.json()

    snapshot_root = temp_dir / "snapshots"
    reviews_path = snapshot_root / "reviews.parquet"
    behavior_path = snapshot_root / "behavior.parquet"
    delivery_path = snapshot_root / "delivery.parquet"
    products_path = snapshot_root / "products.parquet"
    write_parquet(
        reviews_path,
        [
            {"review_id": "R1", "product_id": "B1", "rating": 2},
            {"review_id": "R2", "product_id": "B1", "rating": 4},
            {"review_id": "R3", "product_id": "B2", "rating": 5},
        ],
    )
    write_parquet(
        behavior_path,
        [
            {"event_id": "E1", "product_id": "B1", "event_type": "view"},
            {"event_id": "E2", "product_id": "B1", "event_type": "purchase"},
            {"event_id": "E3", "product_id": "B2", "event_type": "view"},
        ],
    )
    write_parquet(
        delivery_path,
        [
            {"delivery_id": "D1", "product_id": "B1", "late_flag": True},
            {"delivery_id": "D2", "product_id": "B2", "late_flag": False},
        ],
    )
    write_parquet(
        products_path,
        [
            {
                "product_id": "B1",
                "synthetic_product_id": "SP-B1",
                "canonical_product_id": "CP-B1",
                "product_name": "Demo Product 1",
                "normalized_brand": "demo",
                "unified_category": "electronics",
                "category_l1": "electronics",
                "ecommerce_product_id": "EC-B1",
                "amazon_parent_asin": "ASIN-B1",
                "match_confidence": 0.98,
                "match_method": "synthetic_seed",
            },
            {"product_id": "B2", "product_name": "Demo Product 2", "category_l1": "books"},
        ],
    )
    snapshot_payloads = [
        (sources["reviews"], "snapshot_reviews_001", reviews_path, 3),
        (sources["behavior"], "snapshot_behavior_001", behavior_path, 3),
        (sources["delivery"], "snapshot_delivery_001", delivery_path, 2),
        (sources["product_master"], "snapshot_product_master_001", products_path, 2),
    ]

    response = client.post(
        f"/api/target-datasets/{target_dataset['id']}/runs",
        json={
            "executor": "local_runner",
            "triggered_by": "demo_user",
            "source_snapshots": [
                {
                    "snapshot_id": snapshot_id,
                    "source_dataset_id": source["id"],
                    "source_type": source["connection_type"],
                    "artifact_uri": path.as_uri(),
                    "format": "parquet",
                    "row_count": row_count,
                    "bytes": path.stat().st_size,
                    "schema": [{"name": name, "type": "string"} for name in pq.read_schema(path).names],
                    "created_at": "2026-06-30T12:00:00Z",
                }
                for source, snapshot_id, path, row_count in snapshot_payloads
            ],
        },
    )

    assert response.status_code == 201
    run_record = response.json()
    assert run_record["week2_run_id"].startswith("run_product_health_")
    assert run_record["pipeline_id"] == "pipeline_product_health_e2e"
    assert run_record["status"] == "succeeded"
    assert run_record["execution_result"]["target_dataset_handoff"]["runtime_output_scope"] == "product_health_gold_output"
    assert run_record["execution_result"]["target_dataset_handoff"]["runtime_output_dataset_id"] == "dataset_product_health_gold"
    contract = run_record["execution_result"]["product_health_manual_run_contract"]
    assert contract["status"] == "succeeded_product_health_execution"
    assert contract["gold_output"]["status"] == "succeeded_product_health_execution"
    assert contract["gold_output"]["row_count"] == 2
    assert contract["gold_output"]["storage_uri"].startswith("file://")
    assert contract["catalog_payload"]["status"] == "ready_for_catalog_registration"
    assert contract["catalog_payload"]["metrics"]["row_count"] == 2
    assert contract["lineage"]["input_snapshot_ids"] == [
        "snapshot_reviews_001",
        "snapshot_behavior_001",
        "snapshot_delivery_001",
        "snapshot_product_master_001",
    ]
    assert all(snapshot["snapshot_status"] == "ready" for snapshot in contract["source_snapshot_inputs"])
    assert all(result["status"] == "passed" for result in contract["quality_results"])

    output_path = Path(contract["gold_output"]["local_fallback_path"])
    rows = sorted(pq.read_table(output_path).to_pylist(), key=lambda row: row["product_id"])
    assert rows[0]["product_id"] == "B1"
    assert rows[0]["synthetic_product_id"] == "SP-B1"
    assert rows[0]["review_count"] == 2
    assert rows[0]["average_rating"] == 3.0
    assert rows[0]["negative_review_rate"] == 0.5
    assert rows[0]["view_count"] == 1
    assert rows[0]["purchase_count"] == 1
    assert rows[0]["conversion_rate"] == 1.0
    assert rows[0]["delivery_count"] == 1
    assert rows[0]["late_delivery_rate"] == 1.0
    assert rows[0]["risk_score"] == 47.5
    assert rows[1]["product_id"] == "B2"
    assert rows[1]["review_count"] == 1
    assert rows[1]["risk_score"] is not None
