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


def test_product_health_source_inventory_maps_roles_to_runtime_sources_and_fallbacks() -> None:
    client = make_client()

    response = client.get("/api/product-health/source-inventory")

    assert response.status_code == 200
    inventory = response.json()
    assert inventory["scenario_id"] == "product_health"
    assert inventory["status"] in {"ready", "partial"}
    assert len(inventory["sources"]) >= 4

    by_role = {source["role"]: source for source in inventory["sources"]}
    assert by_role["behavior_events"]["source_dataset_name"] == "source_user_events"
    assert by_role["reviews"]["source_dataset_name"] == "source_product_reviews"
    assert by_role["product_catalog"]["source_dataset_name"] == "source_product_catalog"
    assert by_role["delivery_trip_logs"]["source_dataset_name"] == "source_delivery_trip_logs"

    assert by_role["behavior_events"]["connection_type"] == "kafka"
    assert by_role["behavior_events"]["resource_label"] == "kafka_topic"
    assert by_role["behavior_events"]["path"] == "product-health.behavior-events"

    assert by_role["product_catalog"]["connection_type"] == "postgres"
    assert by_role["product_catalog"]["resource_label"] == "postgres_table"
    assert by_role["product_catalog"]["path"] == "public.product_catalog"

    assert by_role["reviews"]["connection_type"] == "mongodb"
    assert by_role["reviews"]["resource_label"] == "mongodb_collection"
    assert by_role["reviews"]["path"] == "asklake.product_reviews"

    assert by_role["delivery_trip_logs"]["connection_type"] == "s3"
    assert by_role["delivery_trip_logs"]["resource_label"] == "s3_prefix"
    assert by_role["delivery_trip_logs"]["path"] == "s3://asklake-demo/product_health/delivery_trip_logs/"

    assert by_role["product_catalog"]["binding_type"] == "runtime_source"
    assert by_role["product_catalog"]["fallback_binding_type"] in {"raw_file", "prepared_dataset"}
    assert by_role["product_catalog"]["status"] == "ready"
    assert by_role["product_catalog"]["bytes"] > 0
    assert by_role["product_catalog"]["schema_preview"]

    assert by_role["reviews"]["binding_type"] == "runtime_source"
    assert by_role["reviews"]["fallback_binding_type"] == "prepared_dataset"
    assert by_role["reviews"]["status"] == "ready"
    assert by_role["reviews"]["bytes"] > 0
    assert by_role["reviews"]["schema_preview"]

    assert by_role["behavior_events"]["status"] in {"ready", "missing"}
    if by_role["behavior_events"]["status"] == "missing":
        assert by_role["behavior_events"]["can_create_source_dataset"] is False
    else:
        assert by_role["behavior_events"]["can_create_source_dataset"] is True
        assert by_role["behavior_events"]["binding_type"] == "runtime_source"
        assert by_role["behavior_events"]["fallback_path"]

    missing_sources = [source for source in inventory["sources"] if source["status"] == "missing"]
    for source in missing_sources:
        assert source["can_create_source_dataset"] is False
        assert source["runtime_source_type"] in {"kafka", "postgres", "mongodb", "s3"}
        assert "fallback" in source["message"].lower() or "missing" in source["message"].lower()
