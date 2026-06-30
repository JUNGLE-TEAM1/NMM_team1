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


def test_product_health_source_datasets_save_runtime_scope_with_fallback_evidence() -> None:
    client = make_client()

    seed_response = client.post("/api/product-health/runtime-connections/seed")
    inventory_response = client.get("/api/product-health/source-inventory")

    assert seed_response.status_code == 200
    assert inventory_response.status_code == 200

    connections_by_name = {connection["name"]: connection for connection in seed_response.json()["connections"]}
    sources = inventory_response.json()["sources"]
    ready_sources = [source for source in sources if source["can_create_source_dataset"]]

    assert {source["role"] for source in ready_sources} == {
        "behavior_events",
        "product_catalog",
        "reviews",
        "delivery_trip_logs",
    }

    expected_connection_types = {
        "behavior_events": "kafka",
        "product_catalog": "postgres",
        "reviews": "mongodb",
        "delivery_trip_logs": "s3",
    }
    expected_runtime_scopes = {
        "behavior_events": "product-health.behavior-events",
        "product_catalog": "public.product_catalog",
        "reviews": "asklake.product_reviews",
        "delivery_trip_logs": "s3://asklake-demo/product_health/delivery_trip_logs/",
    }

    for source in ready_sources:
        connection = connections_by_name[source["connection_name"]]
        response = client.post(
            "/api/source-datasets",
            json={
                "connection_id": connection["id"],
                "connection_name": connection["name"],
                "connection_type": source["connection_type"],
                "name": source["source_dataset_name"],
                "raw_scope": source["path"],
                "resource_label": source["resource_label"],
                "schema_preview": source["schema_preview"],
            },
        )

        assert response.status_code == 201
        dataset = response.json()
        assert dataset["connection_id"] == connection["id"]
        assert dataset["connection_name"] == source["connection_name"]
        assert dataset["connection_type"] == expected_connection_types[source["role"]]
        assert dataset["raw_scope"] == expected_runtime_scopes[source["role"]]
        assert dataset["resource_label"] == source["resource_label"]
        assert dataset["runtime_source"]["resource"] == expected_runtime_scopes[source["role"]]
        assert dataset["runtime_source"]["connection_type"] == expected_connection_types[source["role"]]
        assert dataset["fallback_evidence"]["status"] == "file_backed"
        assert dataset["fallback_evidence"]["path"] != dataset["raw_scope"]
        assert dataset["fallback_evidence"]["path"] == source["fallback_path"]

    list_response = client.get("/api/source-datasets")

    assert list_response.status_code == 200
    assert len(list_response.json()) == 4
