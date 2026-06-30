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


def test_product_health_runtime_connection_seed_creates_external_connections_without_secret_values() -> None:
    client = make_client()

    response = client.post("/api/product-health/runtime-connections/seed")

    assert response.status_code == 200
    payload = response.json()
    assert payload["scenario_id"] == "product_health"
    assert payload["status"] == "seeded"
    assert len(payload["connections"]) == 4
    assert len(payload["readiness"]) == 4

    by_name = {connection["name"]: connection for connection in payload["connections"]}
    assert by_name["conn_product_health_behavior_kafka"]["connector_type"] == "kafka"
    assert by_name["conn_product_health_behavior_kafka"]["resource"] == "127.0.0.1:29092"
    assert by_name["conn_product_health_catalog_postgres"]["connector_type"] == "postgres"
    assert by_name["conn_product_health_catalog_postgres"]["auth_mode"] == "Secret reference only"
    assert by_name["conn_product_health_reviews_mongo"]["connector_type"] == "mongodb"
    assert by_name["conn_product_health_delivery_s3"]["connector_type"] == "s3"

    response_text = response.text
    assert "password" not in response_text.lower()
    assert "access_key" not in response_text.lower()
    assert "secret_key" not in response_text.lower()
    assert "raw_credential" not in response_text.lower()

    readiness_by_role = {item["role"]: item for item in payload["readiness"]}
    assert readiness_by_role["behavior_events"]["readiness_status"] == "testable"
    assert readiness_by_role["behavior_events"]["source_scope"] == "product-health.behavior-events"
    assert readiness_by_role["product_catalog"]["readiness_status"] == "secret_ref_required"
    assert readiness_by_role["reviews"]["readiness_status"] == "secret_ref_required"
    assert readiness_by_role["delivery_trip_logs"]["readiness_status"] == "secret_ref_required"

    list_response = client.get("/api/external-connections")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 4


def test_product_health_runtime_connection_seed_is_idempotent() -> None:
    client = make_client()

    first = client.post("/api/product-health/runtime-connections/seed")
    second = client.post("/api/product-health/runtime-connections/seed")

    assert first.status_code == 200
    assert second.status_code == 200
    assert len(second.json()["connections"]) == 4

    list_response = client.get("/api/external-connections")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 4
