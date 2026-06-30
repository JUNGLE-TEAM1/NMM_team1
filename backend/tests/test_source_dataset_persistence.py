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
        "connection_id": "conn_product_health_reviews_file",
        "connection_name": "Product Health Reviews File",
        "connection_type": "local_file",
        "name": name,
        "raw_scope": "backend/samples/product_health_reviews_seed.jsonl",
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
    assert dataset["connection_id"] == "conn_product_health_reviews_file"
    assert dataset["connection_name"] == "Product Health Reviews File"
    assert dataset["connection_type"] == "local_file"
    assert dataset["name"] == "source_product_health_reviews"
    assert dataset["raw_scope"] == "backend/samples/product_health_reviews_seed.jsonl"
    assert dataset["resource_label"] == "file_path"
    assert dataset["schema_preview"] == [
        {"name": "review_id", "type": "string"},
        {"name": "rating", "type": "number"},
    ]
    assert dataset["layer"] == "source"
    assert dataset["status"] == "metadata_ready"
    assert dataset["created_at"] == dataset["updated_at"]
    assert dataset["file_evidence"]["status"] == "file_backed"
    assert dataset["file_evidence"]["bytes"] > 0
    assert dataset["file_evidence"]["row_count_status"] == "not_measured"

    list_response = client.get("/api/source-datasets")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == dataset["id"]

    detail_response = client.get(f"/api/source-datasets/{dataset['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["raw_scope"] == "backend/samples/product_health_reviews_seed.jsonl"
    assert detail_response.json()["file_evidence"]["status"] == "file_backed"


def test_source_dataset_file_evidence_marks_missing_path() -> None:
    client = make_client()
    payload = source_dataset_payload("source_missing_file")
    payload["raw_scope"] = "data/does-not-exist/missing.jsonl"

    response = client.post("/api/source-datasets", json=payload)

    assert response.status_code == 201
    dataset = response.json()
    assert dataset["file_evidence"]["status"] == "missing"
    assert "찾을 수 없습니다" in dataset["file_evidence"]["message"]


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


def test_update_source_dataset_metadata() -> None:
    client = make_client()
    create_response = client.post("/api/source-datasets", json=source_dataset_payload())
    dataset = create_response.json()

    update_response = client.patch(
        f"/api/source-datasets/{dataset['id']}",
        json={
            "name": "source_product_health_reviews_v2",
            "raw_scope": "backend/samples/product_health_reviews_seed_v2.jsonl",
            "resource_label": "jsonl_path",
            "schema_preview": [
                {"name": "review_id", "type": "string"},
                {"name": "rating", "type": "number"},
                {"name": "risk_signal", "type": "string"},
            ],
        },
    )

    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["id"] == dataset["id"]
    assert updated["name"] == "source_product_health_reviews_v2"
    assert updated["raw_scope"] == "backend/samples/product_health_reviews_seed_v2.jsonl"
    assert updated["resource_label"] == "jsonl_path"
    assert updated["schema_preview"] == [
        {"name": "review_id", "type": "string"},
        {"name": "rating", "type": "number"},
        {"name": "risk_signal", "type": "string"},
    ]
    assert updated["created_at"] == dataset["created_at"]
    assert updated["updated_at"] >= dataset["updated_at"]


def test_update_source_dataset_rejects_duplicate_name() -> None:
    client = make_client()
    first_response = client.post("/api/source-datasets", json=source_dataset_payload("source_reviews_a"))
    second_response = client.post("/api/source-datasets", json=source_dataset_payload("source_reviews_b"))

    update_response = client.patch(
        f"/api/source-datasets/{second_response.json()['id']}",
        json={"name": first_response.json()["name"]},
    )

    assert update_response.status_code == 409
    assert "Source dataset name already exists" in update_response.json()["detail"]


def test_update_missing_source_dataset_returns_not_found() -> None:
    client = make_client()

    response = client.patch("/api/source-datasets/not-found", json={"name": "source_missing"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Source dataset not found"


def test_delete_source_dataset_metadata() -> None:
    client = make_client()
    create_response = client.post("/api/source-datasets", json=source_dataset_payload())
    dataset_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/source-datasets/{dataset_id}")
    detail_response = client.get(f"/api/source-datasets/{dataset_id}")

    assert delete_response.status_code == 204
    assert detail_response.status_code == 404


def test_delete_source_dataset_rejects_silver_dataset_reference() -> None:
    client = make_client()
    source = client.post("/api/source-datasets", json=source_dataset_payload()).json()
    silver_response = client.post(
        "/api/silver-datasets",
        json={
            "source_dataset_id": source["id"],
            "source_dataset_name": source["name"],
            "name": "silver_product_health_reviews",
            "purpose": "source reference guard",
            "standardize_rules": ["normalize ids"],
            "validation_rules": ["require id"],
            "schema_preview": [{"name": "product_id", "type": "string"}],
        },
    )

    response = client.delete(f"/api/source-datasets/{source['id']}")

    assert silver_response.status_code == 201
    assert response.status_code == 409
    assert "referenced by a Silver Dataset" in response.json()["detail"]


def test_delete_missing_source_dataset_returns_not_found() -> None:
    client = make_client()

    response = client.delete("/api/source-datasets/not-found")

    assert response.status_code == 404
    assert response.json()["detail"] == "Source dataset not found"


def test_create_source_dataset_snapshot_materializes_local_rows() -> None:
    client = make_client()
    dataset = client.post("/api/source-datasets", json=source_dataset_payload()).json()

    response = client.post(f"/api/source-datasets/{dataset['id']}/snapshots", json={"sample_size": 2})

    assert response.status_code == 201
    snapshot = response.json()
    assert snapshot["source_dataset_id"] == dataset["id"]
    assert snapshot["source_dataset_name"] == dataset["name"]
    assert snapshot["connection_type"] == "local_file"
    assert snapshot["status"] == "succeeded"
    assert snapshot["row_count"] == 2
    assert snapshot["output_bytes"] > 0
    assert "data/lake/bronze/source_snapshots" in snapshot["output_path"]
    assert Path(snapshot["output_path"]).exists()

    list_response = client.get(f"/api/source-datasets/{dataset['id']}/snapshots")
    detail_response = client.get(f"/api/source-datasets/{dataset['id']}")

    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == snapshot["id"]
    assert detail_response.json()["status"] == "snapshot_ready"


def test_create_source_dataset_snapshot_rejects_missing_input_path() -> None:
    client = make_client()
    payload = source_dataset_payload("source_snapshot_missing")
    payload["raw_scope"] = "data/does-not-exist/missing.jsonl"
    dataset = client.post("/api/source-datasets", json=payload).json()

    response = client.post(f"/api/source-datasets/{dataset['id']}/snapshots", json={"sample_size": 2})
    list_response = client.get(f"/api/source-datasets/{dataset['id']}/snapshots")

    assert response.status_code == 400
    assert "Local path" in response.json()["detail"]
    assert list_response.json() == []
