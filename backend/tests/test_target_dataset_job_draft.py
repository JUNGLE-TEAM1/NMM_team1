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
                {"name": "review_id", "type": "string"},
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
