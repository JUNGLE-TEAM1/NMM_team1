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


def create_source_dataset(
    client: TestClient,
    name: str = "source_product_health_reviews",
    raw_scope: str = "/data/incoming/product_health_reviews.csv",
    schema_preview: list[dict[str, str]] | None = None,
) -> dict:
    response = client.post(
        "/api/source-datasets",
        json={
            "connection_id": "conn_product_health_csv",
            "connection_name": "Product Health CSV Connection",
            "connection_type": "csv",
            "name": name,
            "raw_scope": raw_scope,
            "resource_label": "file_path",
            "schema_preview": schema_preview
            or [
                {"name": "review_id", "type": "string"},
                {"name": "product_id", "type": "string"},
                {"name": "rating", "type": "number"},
                {"name": "sentiment", "type": "string"},
            ],
        },
    )
    assert response.status_code == 201
    return response.json()


def target_dataset_payload(source_dataset: dict, name: str = "dataset_product_health_gold") -> dict:
    return {
        "name": name,
        "description": "제품 상태 분석용 gold dataset draft",
        "source_dataset_id": source_dataset["id"],
        "source_dataset_name": source_dataset["name"],
        "source_type": source_dataset["connection_type"],
        "selected_fields": ["review_id", "rating"],
        "process_rule": {"type": "select_fields", "selected_fields": ["review_id", "rating"]},
        "schedule": {"mode": "manual", "note": "데모에서는 수동 실행으로만 준비합니다."},
        "output_schema": [
            {"name": "review_id", "type": "string"},
            {"name": "rating", "type": "number"},
        ],
    }


def test_create_list_and_read_target_dataset_job_draft() -> None:
    client = make_client()
    source_dataset = create_source_dataset(client)

    response = client.post("/api/target-datasets", json=target_dataset_payload(source_dataset))

    assert response.status_code == 201
    dataset = response.json()
    assert dataset["id"]
    assert dataset["name"] == "dataset_product_health_gold"
    assert dataset["source_dataset_id"] == source_dataset["id"]
    assert dataset["selected_fields"] == ["review_id", "rating"]
    assert dataset["process_rule"] == {"type": "select_fields", "selected_fields": ["review_id", "rating"]}
    assert dataset["schedule"]["mode"] == "manual"
    assert dataset["output_schema"] == [
        {"name": "review_id", "type": "string"},
        {"name": "rating", "type": "number"},
    ]
    assert dataset["status"] == "draft"
    assert dataset["created_at"] == dataset["updated_at"]
    assert dataset["job_definition"]["job_type"] == "target_dataset_etl_draft"
    assert dataset["job_definition"]["status"] == "draft"
    assert dataset["job_definition"]["target_dataset_id"] == dataset["id"]
    assert dataset["job_definition"]["source_dataset_id"] == source_dataset["id"]
    assert dataset["job_definition"]["process_rule"]["type"] == "select_fields"
    assert dataset["job_definition"]["schedule"]["mode"] == "manual"

    list_response = client.get("/api/target-datasets")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == dataset["id"]

    detail_response = client.get(f"/api/target-datasets/{dataset['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["job_definition"]["status"] == "draft"

    runs_response = client.get("/api/pipeline-runs/not-created-by-draft")
    assert runs_response.status_code == 404


def test_create_target_dataset_rejects_duplicate_name() -> None:
    client = make_client()
    source_dataset = create_source_dataset(client)

    first_response = client.post("/api/target-datasets", json=target_dataset_payload(source_dataset))
    duplicate_response = client.post("/api/target-datasets", json=target_dataset_payload(source_dataset))

    assert first_response.status_code == 201
    assert duplicate_response.status_code == 409
    assert "Target dataset name already exists" in duplicate_response.json()["detail"]


def test_create_target_dataset_requires_existing_source_dataset() -> None:
    client = make_client()
    missing_source_payload = target_dataset_payload(
        {
            "id": "missing-source-dataset",
            "name": "source_missing",
            "connection_type": "csv",
        },
    )

    response = client.post("/api/target-datasets", json=missing_source_payload)

    assert response.status_code == 404
    assert response.json()["detail"] == "Source dataset not found"


def test_create_target_dataset_stores_multi_source_role_mappings() -> None:
    client = make_client()
    reviews = create_source_dataset(client, name="source_product_health_reviews")
    behavior = create_source_dataset(
        client,
        name="source_product_health_behavior",
        raw_scope="/data/incoming/product_health_behavior.jsonl",
        schema_preview=[
            {"name": "product_id", "type": "string"},
            {"name": "event_type", "type": "string"},
            {"name": "event_time", "type": "timestamp"},
        ],
    )
    delivery = create_source_dataset(
        client,
        name="source_product_health_delivery",
        raw_scope="/data/incoming/product_health_delivery.parquet",
        schema_preview=[
            {"name": "product_id", "type": "string"},
            {"name": "late_flag", "type": "boolean"},
        ],
    )
    product_master = create_source_dataset(
        client,
        name="source_product_master",
        raw_scope="/data/incoming/product_master.csv",
        schema_preview=[
            {"name": "product_id", "type": "string"},
            {"name": "product_name", "type": "string"},
            {"name": "category_l1", "type": "string"},
        ],
    )
    source_mappings = [
        {
            "role": "reviews",
            "source_id": "source_reviews_seed",
            "source_dataset_id": reviews["id"],
            "source_dataset_name": reviews["name"],
            "source_type": reviews["connection_type"],
            "required_fields": ["product_id", "rating"],
            "optional_fields": ["review_id", "sentiment"],
            "produces_metrics": ["review_count", "average_rating", "negative_review_rate"],
        },
        {
            "role": "behavior",
            "source_id": "source_behavior_events_seed",
            "source_dataset_id": behavior["id"],
            "source_dataset_name": behavior["name"],
            "source_type": behavior["connection_type"],
            "required_fields": ["product_id", "event_type"],
            "optional_fields": ["event_time"],
            "produces_metrics": ["view_count", "purchase_count", "conversion_rate"],
        },
        {
            "role": "delivery",
            "source_id": "source_delivery_trips_seed",
            "source_dataset_id": delivery["id"],
            "source_dataset_name": delivery["name"],
            "source_type": delivery["connection_type"],
            "required_fields": ["product_id"],
            "optional_fields": ["late_flag"],
            "produces_metrics": ["delivery_count", "late_delivery_rate"],
        },
        {
            "role": "product_master",
            "source_id": "source_product_master_seed",
            "source_dataset_id": product_master["id"],
            "source_dataset_name": product_master["name"],
            "source_type": product_master["connection_type"],
            "required_fields": ["product_id"],
            "optional_fields": ["product_name", "category_l1"],
            "produces_metrics": [],
        },
    ]
    payload = target_dataset_payload(reviews)
    payload["source_mappings"] = source_mappings
    payload["process_rule"] = {
        "type": "product_health_gold_pipeline",
        "mode": "recommended_template",
        "template_id": "product_health_recommended_v1",
        "template_version": "transform_product_health_gold_v1",
        "final_output": {
            "dataset_id": "dataset_product_health_gold",
            "query_table": "gold_product_health",
            "layer": "gold",
            "user_facing": True,
        },
        "internal_artifacts_visible": False,
    }

    response = client.post("/api/target-datasets", json=payload)

    assert response.status_code == 201
    dataset = response.json()
    assert [mapping["role"] for mapping in dataset["source_mappings"]] == [
        "reviews",
        "behavior",
        "delivery",
        "product_master",
    ]
    assert dataset["source_mappings"][1]["source_id"] == "source_behavior_events_seed"
    assert dataset["job_definition"]["source_mappings"] == dataset["source_mappings"]
    assert dataset["process_rule"]["source_mappings"] == dataset["source_mappings"]
    assert dataset["process_rule"]["type"] == "product_health_gold_pipeline"
    assert dataset["process_rule"]["final_output"]["query_table"] == "gold_product_health"
    assert dataset["process_rule"]["internal_artifacts_visible"] is False

    detail_response = client.get(f"/api/target-datasets/{dataset['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["source_mappings"][3]["source_dataset_id"] == product_master["id"]


def test_create_target_dataset_rejects_missing_source_mapping_dataset() -> None:
    client = make_client()
    reviews = create_source_dataset(client)
    payload = target_dataset_payload(reviews)
    payload["source_mappings"] = [
        {
            "role": "behavior",
            "source_id": "source_behavior_events_seed",
            "source_dataset_id": "missing-source-dataset",
            "source_dataset_name": "source_missing_behavior",
            "source_type": "csv",
        },
    ]

    response = client.post("/api/target-datasets", json=payload)

    assert response.status_code == 404
    assert response.json()["detail"] == "Source dataset not found for role behavior"
