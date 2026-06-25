import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from app.core.settings import Settings


def make_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    settings = Settings(
        metadata_url=f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}",
        result_store_path=str(Path(temp_dir.name) / "results"),
    )
    store = SQLiteMetadataStore(settings.metadata_url)
    app = create_app(store, settings)
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def test_week2_workflow_run_returns_execution_result_contract() -> None:
    client = make_client()

    response = client.post(
        "/api/week2/workflows/pipeline_reviews_json_e2e/runs",
        json={"executor": "local_runner", "triggered_by": "m5_owner"},
    )

    assert response.status_code == 201
    run = response.json()
    assert run["contract"] == "ExecutionResult"
    assert run["pipeline_id"] == "pipeline_reviews_json_e2e"
    assert run["run_id"] == "run_reviews_demo_001"
    assert run["executor"] == "local_runner"
    assert run["status"] == "fallback_succeeded"
    assert run["triggered_by"] == "m5_owner"
    assert run["outputs"][0]["uri"] == "s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/"
    assert [task["node_id"] for task in run["task_results"]] == [
        "node_source_reviews",
        "node_filter_reviews",
        "node_normalize_reviews",
        "node_aggregate_reviews",
        "node_load_reviews",
    ]

    get_response = client.get("/api/week2/runs/run_reviews_demo_001")

    assert get_response.status_code == 200
    assert get_response.json()["run_id"] == run["run_id"]


def test_week2_catalog_metadata_tracks_successful_run_lineage() -> None:
    client = make_client()

    run_response = client.post("/api/week2/workflows/pipeline_reviews_json_e2e/runs")
    assert run_response.status_code == 201

    response = client.get("/api/week2/catalog/dataset_reviews_gold")

    assert response.status_code == 200
    catalog = response.json()
    assert catalog["contract"] == "CatalogMetadata"
    assert catalog["dataset_id"] == "dataset_reviews_gold"
    assert catalog["s3_uri"] == "s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/"
    assert catalog["lineage"]["pipeline_id"] == "pipeline_reviews_json_e2e"
    assert catalog["lineage"]["run_id"] == "run_reviews_demo_001"
    assert catalog["query"]["allow_readonly_sql"] is True
    assert catalog["metrics"]["quality"] == {
        "schema_match": "pending",
        "row_count_checked": False,
    }


def test_week2_workflow_routes_return_not_found_for_unknown_ids() -> None:
    client = make_client()

    run_response = client.post("/api/week2/workflows/missing/runs")
    get_run_response = client.get("/api/week2/runs/missing")
    catalog_response = client.get("/api/week2/catalog/missing")

    assert run_response.status_code == 404
    assert get_run_response.status_code == 404
    assert catalog_response.status_code == 404
