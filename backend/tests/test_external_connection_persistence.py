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


def external_connection_payload(name: str = "conn_product_health_reviews_file") -> dict:
    return {
        "name": name,
        "connector_type": "local_file",
        "resource": "backend/samples/product_health_reviews_seed.jsonl",
        "resource_label": "file_path",
        "auth_mode": "No credential",
        "mode_label": "직접 연결 가능",
        "contract_hint": "SourceConfig.connection_ref.path",
        "detected_format": "JSONL",
        "detected_dataset": "Product reviews / VOC",
        "confidence": "High",
        "recommended_role": "Source Dataset",
        "sync_mode": "manual",
        "sync_schedule": "manual on demand",
        "schema_preview": [
            {"name": "review_id", "type": "string"},
            {"name": "rating", "type": "number"},
        ],
    }


def test_create_list_and_read_external_connection_metadata() -> None:
    client = make_client()

    response = client.post("/api/external-connections", json=external_connection_payload())

    assert response.status_code == 201
    connection = response.json()
    assert connection["id"]
    assert connection["name"] == "conn_product_health_reviews_file"
    assert connection["connector_type"] == "local_file"
    assert connection["resource"] == "backend/samples/product_health_reviews_seed.jsonl"
    assert connection["status"] == "metadata_ready"
    assert connection["sync_mode"] == "manual"
    assert connection["sync_schedule"] == "manual on demand"
    assert connection["schema_preview"] == [
        {"name": "review_id", "type": "string"},
        {"name": "rating", "type": "number"},
    ]

    list_response = client.get("/api/external-connections")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == connection["id"]

    detail_response = client.get(f"/api/external-connections/{connection['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["detected_dataset"] == "Product reviews / VOC"


def test_create_external_connection_rejects_duplicate_name() -> None:
    client = make_client()

    first_response = client.post("/api/external-connections", json=external_connection_payload())
    duplicate_response = client.post("/api/external-connections", json=external_connection_payload())

    assert first_response.status_code == 201
    assert duplicate_response.status_code == 409
    assert "External connection name already exists" in duplicate_response.json()["detail"]


def test_get_missing_external_connection_returns_not_found() -> None:
    client = make_client()

    response = client.get("/api/external-connections/not-found")

    assert response.status_code == 404
    assert response.json()["detail"] == "External connection not found"


def test_external_connection_credential_policy_is_secret_ref_design_only() -> None:
    client = make_client()

    response = client.get("/api/external-connections/credential-policy")

    assert response.status_code == 200
    policy = response.json()
    assert policy["status"] == "secret_ref_design_only"
    assert policy["credential_storage"] == "secret_ref_only"
    assert policy["secret_value_storage"] == "forbidden"
    assert policy["connection_test_enabled"] is True
    assert policy["inspect_requires_secret_ref"] is True
    assert "postgres" in policy["required_references"]
    assert "mongodb" in policy["required_references"]
    assert "s3" in policy["required_references"]
    assert "password" in policy["forbidden_request_fields"]
    assert "raw_credential" in policy["forbidden_request_fields"]


def test_update_external_connection_metadata() -> None:
    client = make_client()
    connection = client.post("/api/external-connections", json=external_connection_payload()).json()

    response = client.patch(
        f"/api/external-connections/{connection['id']}",
        json={
            "name": "conn_product_health_reviews_file_v2",
            "resource": "backend/samples/product_health_reviews_v2.jsonl",
            "sync_mode": "scheduled",
            "sync_schedule": "daily 09:00 KST",
            "schema_preview": [{"name": "review_id", "type": "string"}, {"name": "score", "type": "number"}],
        },
    )

    assert response.status_code == 200
    updated = response.json()
    assert updated["id"] == connection["id"]
    assert updated["name"] == "conn_product_health_reviews_file_v2"
    assert updated["resource"] == "backend/samples/product_health_reviews_v2.jsonl"
    assert updated["sync_mode"] == "scheduled"
    assert updated["sync_schedule"] == "daily 09:00 KST"
    assert updated["schema_preview"] == [{"name": "review_id", "type": "string"}, {"name": "score", "type": "number"}]
    assert updated["created_at"] == connection["created_at"]
    assert updated["updated_at"] >= connection["updated_at"]


def test_delete_external_connection_metadata() -> None:
    client = make_client()
    connection = client.post("/api/external-connections", json=external_connection_payload()).json()

    response = client.delete(f"/api/external-connections/{connection['id']}")

    assert response.status_code == 204
    assert client.get(f"/api/external-connections/{connection['id']}").status_code == 404


def test_delete_external_connection_rejects_source_dataset_reference() -> None:
    client = make_client()
    connection = client.post("/api/external-connections", json=external_connection_payload()).json()
    source_response = client.post(
        "/api/source-datasets",
        json={
            "connection_id": connection["id"],
            "connection_name": connection["name"],
            "connection_type": connection["connector_type"],
            "name": "source_product_health_reviews",
            "raw_scope": connection["resource"],
            "resource_label": connection["resource_label"],
            "schema_preview": connection["schema_preview"],
        },
    )

    response = client.delete(f"/api/external-connections/{connection['id']}")

    assert source_response.status_code == 201
    assert response.status_code == 409
    assert "referenced by a Source Dataset" in response.json()["detail"]
