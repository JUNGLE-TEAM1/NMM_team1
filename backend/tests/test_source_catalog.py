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
    assert payload["dataset"]["trust_status"] == "Draft"
    assert payload["dataset"]["trust_gate_result"]["status"] == "Draft"
    assert payload["dataset"]["trust_gate_result"]["passed_gates"] == ["schema"]
    assert "quality gate is pending" in payload["dataset"]["trust_gate_result"]["reasons"]
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
    assert dataset_detail.json()["trust_status"] == "Draft"


def test_catalog_dataset_can_be_published_when_all_trust_gates_pass() -> None:
    client = make_client()
    source_response = client.post(
        "/api/sources",
        json={"name": "trusted_orders", "type": "csv", "path": "samples/orders.csv"},
    )
    assert source_response.status_code == 201
    dataset_id = source_response.json()["dataset"]["id"]

    response = client.post(
        f"/api/catalog/datasets/{dataset_id}/trust-gate",
        json={
            "owner": "data-team",
            "passed_gates": ["schema", "quality", "pii", "owner", "policy", "approval"],
        },
    )

    assert response.status_code == 200
    gate = response.json()
    assert gate["dataset_id"] == dataset_id
    assert gate["status"] == "Trusted"
    assert gate["failed_gates"] == []
    assert "all required trust gates passed" in gate["reasons"]

    dataset = client.get(f"/api/catalog/datasets/{dataset_id}").json()
    assert dataset["owner"] == "data-team"
    assert dataset["trust_status"] == "Trusted"
    assert dataset["trust_gate_result"]["id"] == gate["id"]


def test_catalog_dataset_stays_verifying_when_required_trust_gates_are_pending() -> None:
    client = make_client()
    source_response = client.post(
        "/api/sources",
        json={"name": "verifying_orders", "type": "csv", "path": "samples/orders.csv"},
    )
    assert source_response.status_code == 201
    dataset_id = source_response.json()["dataset"]["id"]

    response = client.post(
        f"/api/catalog/datasets/{dataset_id}/trust-gate",
        json={"owner": "data-team", "passed_gates": ["schema", "quality"]},
    )

    assert response.status_code == 200
    gate = response.json()
    assert gate["status"] == "Verifying"
    assert gate["failed_gates"] == []
    assert "pii gate is pending" in gate["reasons"]

    dataset = client.get(f"/api/catalog/datasets/{dataset_id}").json()
    assert dataset["trust_status"] == "Verifying"


def test_catalog_dataset_stays_blocked_when_required_trust_gate_fails() -> None:
    client = make_client()
    source_response = client.post(
        "/api/sources",
        json={"name": "blocked_orders", "type": "csv", "path": "samples/orders.csv"},
    )
    assert source_response.status_code == 201
    dataset_id = source_response.json()["dataset"]["id"]

    response = client.post(
        f"/api/catalog/datasets/{dataset_id}/trust-gate",
        json={"owner": "data-team", "passed_gates": ["schema", "quality"], "failed_gates": ["pii"]},
    )

    assert response.status_code == 200
    gate = response.json()
    assert gate["status"] == "Blocked"
    assert gate["failed_gates"] == ["pii"]
    assert "pii gate failed" in gate["reasons"]

    dataset = client.get(f"/api/catalog/datasets/{dataset_id}").json()
    assert dataset["trust_status"] == "Blocked"


def test_trust_gate_returns_not_found_for_missing_dataset() -> None:
    client = make_client()

    response = client.post(
        "/api/catalog/datasets/not-found/trust-gate",
        json={"passed_gates": ["schema"]},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Catalog dataset not found"


def test_register_missing_csv_returns_validation_error() -> None:
    client = make_client()

    response = client.post(
        "/api/sources",
        json={"name": "missing_orders", "type": "csv", "path": "samples/missing.csv"},
    )

    assert response.status_code == 400
    assert "CSV file not found" in response.json()["detail"]
    assert client.get("/api/catalog/datasets").json() == []
