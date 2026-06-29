import tempfile
from pathlib import Path

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


def create_source_dataset(client: TestClient) -> dict:
    response = client.post(
        "/api/source-datasets",
        json={
            "connection_id": "conn_product_health_csv",
            "connection_name": "Product Health CSV Connection",
            "connection_type": "csv",
            "name": "source_product_health_reviews",
            "raw_scope": "/data/incoming/product_health_reviews.csv",
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
