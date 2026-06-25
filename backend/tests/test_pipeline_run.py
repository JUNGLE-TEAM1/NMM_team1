from pathlib import Path

from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from app.core.settings import Settings


def make_client(tmp_path: Path) -> TestClient:
    settings = Settings(
        metadata_url=f"sqlite:///{tmp_path / 'metadata.db'}",
        result_store_path=str(tmp_path / "results"),
    )
    store = SQLiteMetadataStore(settings.metadata_url)
    app = create_app(store, settings)
    return TestClient(app)


def register_sample_source(client: TestClient) -> dict:
    response = client.post(
        "/api/sources",
        json={"name": "pipeline_orders", "type": "csv", "path": "samples/orders.csv"},
    )
    assert response.status_code == 201
    return response.json()


def test_create_and_run_pipeline_success(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    source_payload = register_sample_source(client)

    pipeline_response = client.post(
        "/api/pipelines",
        json={
            "name": "orders_amounts",
            "source_dataset_id": source_payload["dataset"]["id"],
            "select_fields": ["order_id", "amount"],
            "target_name": "orders_amounts_result",
        },
    )

    assert pipeline_response.status_code == 201
    pipeline = pipeline_response.json()
    assert pipeline["select_fields"] == ["order_id", "amount"]

    run_response = client.post(f"/api/pipelines/{pipeline['id']}/runs")

    assert run_response.status_code == 201
    run = run_response.json()
    assert run["status"] == "success"
    assert run["row_count"] == 5
    assert run["result_dataset_id"]
    assert run["result_location"].endswith(".csv")
    assert "success" in run["logs"]

    dataset_response = client.get(f"/api/catalog/datasets/{run['result_dataset_id']}")
    assert dataset_response.status_code == 200
    dataset = dataset_response.json()
    assert dataset["name"] == "orders_amounts_result"
    assert dataset["source_type"] == "pipeline_result"
    assert dataset["schema"] == [
        {"name": "order_id", "type": "string"},
        {"name": "amount", "type": "integer"},
    ]
    assert dataset["sample"][0] == {"order_id": "A001", "amount": 12000}


def test_create_pipeline_rejects_unknown_select_field(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    source_payload = register_sample_source(client)

    response = client.post(
        "/api/pipelines",
        json={
            "name": "bad_orders",
            "source_dataset_id": source_payload["dataset"]["id"],
            "select_fields": ["missing_field"],
            "target_name": "bad_result",
        },
    )

    assert response.status_code == 400
    assert "Unknown select fields" in response.json()["detail"]


def test_pipeline_run_records_failed_status_when_source_disappears(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    csv_path = tmp_path / "orders.csv"
    csv_path.write_text("order_id,amount\nA-1,100\n", encoding="utf-8")

    source_response = client.post(
        "/api/sources",
        json={"name": "unstable_orders", "type": "csv", "path": str(csv_path)},
    )
    assert source_response.status_code == 201
    source_payload = source_response.json()
    pipeline_response = client.post(
        "/api/pipelines",
        json={
            "name": "unstable_pipeline",
            "source_dataset_id": source_payload["dataset"]["id"],
            "select_fields": ["order_id"],
            "target_name": "unstable_result",
        },
    )
    assert pipeline_response.status_code == 201
    csv_path.unlink()

    run_response = client.post(f"/api/pipelines/{pipeline_response.json()['id']}/runs")

    assert run_response.status_code == 201
    run = run_response.json()
    assert run["status"] == "failed"
    assert "CSV file not found" in run["error_message"]


def test_run_missing_pipeline_returns_not_found(tmp_path: Path) -> None:
    client = make_client(tmp_path)

    response = client.post("/api/pipelines/not-found/runs")

    assert response.status_code == 404
    assert response.json()["detail"] == "Pipeline not found"
