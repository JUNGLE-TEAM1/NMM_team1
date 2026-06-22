import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import create_app
from app.metadata_store import SQLiteMetadataStore


def make_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    store = SQLiteMetadataStore(f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}")
    app = create_app(store)
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def test_register_csv_source_and_read_catalog_detail() -> None:
    client = make_client()

    response = client.post(
        "/api/sources",
        json={"name": "sample_orders", "type": "csv", "path": "samples/orders.csv"},
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["source"]["id"]
    assert payload["source"]["dataset_id"] == payload["dataset"]["id"]
    assert payload["dataset"]["status"] == "ready"
    assert payload["dataset"]["row_count"] == 5
    assert payload["dataset"]["schema"][0] == {"name": "order_id", "type": "string"}
    assert payload["dataset"]["schema"][2] == {"name": "amount", "type": "integer"}
    assert payload["dataset"]["sample"][0]["amount"] == 12000

    sources = client.get("/api/sources")
    assert sources.status_code == 200
    assert sources.json()[0]["name"] == "sample_orders"

    source_detail = client.get(f"/api/sources/{payload['source']['id']}")
    assert source_detail.status_code == 200
    assert source_detail.json()["dataset_id"] == payload["dataset"]["id"]

    catalog = client.get("/api/catalog/datasets")
    assert catalog.status_code == 200
    assert catalog.json()[0]["id"] == payload["dataset"]["id"]

    dataset_detail = client.get(f"/api/catalog/datasets/{payload['dataset']['id']}")
    assert dataset_detail.status_code == 200
    assert dataset_detail.json()["sample"][1]["customer"] == "Lee"


def test_register_missing_csv_returns_validation_error() -> None:
    client = make_client()

    response = client.post(
        "/api/sources",
        json={"name": "missing_orders", "type": "csv", "path": "samples/missing.csv"},
    )

    assert response.status_code == 400
    assert "CSV file not found" in response.json()["detail"]
    assert client.get("/api/catalog/datasets").json() == []
