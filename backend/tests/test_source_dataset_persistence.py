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


def source_dataset_payload(name: str = "source_product_health_reviews") -> dict:
    return {
        "connection_id": "conn_product_health_csv",
        "connection_name": "Product Health CSV Connection",
        "connection_type": "csv",
        "name": name,
        "raw_scope": "/data/incoming/product_health_reviews.csv",
        "resource_label": "file_path",
        "schema_preview": [
            {"name": "review_id", "type": "string"},
            {"name": "rating", "type": "number"},
        ],
    }


def test_create_list_and_read_source_dataset_metadata() -> None:
    client = make_client()

    response = client.post("/api/source-datasets", json=source_dataset_payload())

    assert response.status_code == 201
    dataset = response.json()
    assert dataset["id"]
    assert dataset["connection_id"] == "conn_product_health_csv"
    assert dataset["connection_name"] == "Product Health CSV Connection"
    assert dataset["connection_type"] == "csv"
    assert dataset["name"] == "source_product_health_reviews"
    assert dataset["raw_scope"] == "/data/incoming/product_health_reviews.csv"
    assert dataset["resource_label"] == "file_path"
    assert dataset["schema_preview"] == [
        {"name": "review_id", "type": "string"},
        {"name": "rating", "type": "number"},
    ]
    assert dataset["layer"] == "source"
    assert dataset["status"] == "metadata_ready"
    assert dataset["created_at"] == dataset["updated_at"]

    list_response = client.get("/api/source-datasets")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == dataset["id"]

    detail_response = client.get(f"/api/source-datasets/{dataset['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["raw_scope"] == "/data/incoming/product_health_reviews.csv"


def test_create_source_dataset_rejects_duplicate_name() -> None:
    client = make_client()

    first_response = client.post("/api/source-datasets", json=source_dataset_payload())
    duplicate_response = client.post("/api/source-datasets", json=source_dataset_payload())

    assert first_response.status_code == 201
    assert duplicate_response.status_code == 409
    assert "Source dataset name already exists" in duplicate_response.json()["detail"]


def test_get_missing_source_dataset_returns_not_found() -> None:
    client = make_client()

    response = client.get("/api/source-datasets/not-found")

    assert response.status_code == 404
    assert response.json()["detail"] == "Source dataset not found"


def test_delete_source_dataset_disconnects_metadata() -> None:
    client = make_client()
    dataset = client.post("/api/source-datasets", json=source_dataset_payload()).json()

    delete_response = client.delete(f"/api/source-datasets/{dataset['id']}")
    detail_response = client.get(f"/api/source-datasets/{dataset['id']}")
    list_response = client.get("/api/source-datasets")

    assert delete_response.status_code == 204
    assert detail_response.status_code == 404
    assert list_response.status_code == 200
    assert list_response.json() == []
