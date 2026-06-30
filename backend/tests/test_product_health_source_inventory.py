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


def test_product_health_source_inventory_distinguishes_raw_prepared_and_missing() -> None:
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

    assert by_role["product_catalog"]["binding_type"] == "raw_file"
    assert by_role["product_catalog"]["status"] == "ready"
    assert by_role["product_catalog"]["bytes"] > 0
    assert by_role["product_catalog"]["schema_preview"]

    assert by_role["reviews"]["binding_type"] == "prepared_dataset"
    assert by_role["reviews"]["status"] == "ready"
    assert by_role["reviews"]["bytes"] > 0
    assert by_role["reviews"]["schema_preview"]

    assert by_role["behavior_events"]["status"] in {"ready", "missing"}
    if by_role["behavior_events"]["status"] == "missing":
        assert by_role["behavior_events"]["can_create_source_dataset"] is False
    else:
        assert by_role["behavior_events"]["can_create_source_dataset"] is True

    missing_sources = [source for source in inventory["sources"] if source["status"] == "missing"]
    for source in missing_sources:
        assert source["can_create_source_dataset"] is False
        assert "없" in source["message"] or "missing" in source["message"].lower()
