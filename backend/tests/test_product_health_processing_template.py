import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app


def make_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    store = SQLiteMetadataStore(f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}")
    app = create_app(store)
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
                {"name": "product_id", "type": "string"},
                {"name": "rating", "type": "number"},
                {"name": "sentiment", "type": "string"},
            ],
        },
    )
    assert response.status_code == 201
    return response.json()


def test_product_health_processing_template_maps_m3_contracts() -> None:
    client = make_client()

    response = client.get("/api/processing-templates/product-health")

    assert response.status_code == 200
    template = response.json()
    assert template["id"] == "product_health_recommended_v1"
    assert template["target_dataset"] == "dataset_product_health_gold"
    assert template["query_table"] == "gold_product_health"
    assert template["flow"] == ["bronze", "silver", "aggregate", "join", "derive", "load"]
    assert [step["phase"] for step in template["steps"][:4]] == ["bronze", "bronze", "bronze", "bronze"]
    assert {"silver", "aggregate", "join", "derive", "load"}.issubset({step["phase"] for step in template["steps"]})
    assert any(rule["id"] == "risk_score_range" for rule in template["quality_rules"])
    assert [field["name"] for field in template["output_schema"]] == [
        "product_id",
        "product_name",
        "category_l1",
        "review_count",
        "average_rating",
        "negative_review_rate",
        "view_count",
        "purchase_count",
        "conversion_rate",
        "delivery_count",
        "late_delivery_rate",
        "risk_score",
    ]


def test_target_dataset_can_store_product_health_recommended_process_rule() -> None:
    client = make_client()
    source_dataset = create_source_dataset(client)
    template = client.get("/api/processing-templates/product-health").json()
    output_schema = [{"name": field["name"], "type": field["type"]} for field in template["output_schema"]]

    response = client.post(
        "/api/target-datasets",
        json={
            "name": "dataset_product_health_gold",
            "description": "제품 상태 분석용 gold dataset draft",
            "source_dataset_id": source_dataset["id"],
            "source_dataset_name": source_dataset["name"],
            "source_type": source_dataset["connection_type"],
            "selected_fields": ["product_id", "rating", "sentiment"],
            "process_rule": {
                "type": "product_health_gold_pipeline",
                "mode": "recommended_template",
                "input_kind": "raw_sources",
                "template_id": template["id"],
                "template_version": template["template_version"],
                "target_dataset": template["target_dataset"],
                "query_table": template["query_table"],
                "final_output": {
                    "dataset_id": template["target_dataset"],
                    "query_table": template["query_table"],
                    "layer": "gold",
                    "user_facing": True,
                },
                "internal_stages": template["flow"],
                "internal_artifacts_visible": False,
                "steps": template["steps"],
                "quality_rules": template["quality_rules"],
            },
            "schedule": {"mode": "manual", "note": "데모에서는 수동 실행으로만 준비합니다."},
            "output_schema": output_schema,
        },
    )

    assert response.status_code == 201
    dataset = response.json()
    assert dataset["process_rule"]["type"] == "product_health_gold_pipeline"
    assert dataset["process_rule"]["final_output"]["query_table"] == "gold_product_health"
    assert dataset["process_rule"]["internal_artifacts_visible"] is False
    assert dataset["process_rule"]["steps"][0]["phase"] == "bronze"
    assert any(rule["id"] == "zero_denominator_policy" for rule in dataset["process_rule"]["quality_rules"])
    assert dataset["job_definition"]["process_rule"]["query_table"] == "gold_product_health"
    assert dataset["output_schema"][-1] == {"name": "risk_score", "type": "number"}
