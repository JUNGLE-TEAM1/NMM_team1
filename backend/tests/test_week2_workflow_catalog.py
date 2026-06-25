import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from app.core.settings import Settings
from app.services.week2_local_runner import Week2RunnerResult
from app.services.week2_workflow import Week2WorkflowNotFoundError, Week2WorkflowService


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
    assert run["row_count"] == 4
    assert run["bytes"] > 0
    assert run["duration_ms"] >= 1
    assert run["metric_semantics"]["row_count"] == "primary_input_rows_processed"
    assert run["metric_semantics"]["bytes"] == "primary_input_bytes_read"
    assert run["outputs"][0]["uri"] == "s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/"
    assert [task["node_id"] for task in run["task_results"]] == [
        "node_source_reviews",
        "node_filter_reviews",
        "node_normalize_reviews",
        "node_aggregate_reviews",
        "node_load_reviews",
    ]
    assert [task["row_count"] for task in run["task_results"]] == [4, 4, 4, 3, 3]
    assert run["task_results"][0]["bytes"] == run["bytes"]
    assert run["task_results"][-1]["bytes"] > 0

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
    assert Path(catalog["storage"]["local_fallback_path"]).exists()
    assert catalog["lineage"]["pipeline_id"] == "pipeline_reviews_json_e2e"
    assert catalog["lineage"]["run_id"] == "run_reviews_demo_001"
    assert catalog["query"]["allow_readonly_sql"] is True
    assert catalog["metrics"]["semantics"] == {
        "row_count": "output_dataset_rows",
        "bytes": "output_dataset_bytes",
    }
    assert catalog["metrics"]["row_count"] == 3
    assert catalog["metrics"]["bytes"] > 0
    assert catalog["metrics"]["quality"] == {
        "schema_match": "passed",
        "row_count_checked": True,
    }


def test_week2_catalog_metadata_tracks_latest_successful_run() -> None:
    client = make_client()

    first_run_response = client.post("/api/week2/workflows/pipeline_reviews_json_e2e/runs")
    second_run_response = client.post("/api/week2/workflows/pipeline_reviews_json_e2e/runs")

    assert first_run_response.status_code == 201
    assert second_run_response.status_code == 201
    assert first_run_response.json()["run_id"] == "run_reviews_demo_001"
    assert second_run_response.json()["run_id"] == "run_reviews_demo_002"

    response = client.get("/api/week2/catalog/dataset_reviews_gold")

    assert response.status_code == 200
    catalog = response.json()
    assert catalog["s3_uri"] == "s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_002/"
    assert catalog["storage"]["prefix"] == "reviews/gold/run_id=run_reviews_demo_002/"
    assert catalog["storage"]["local_fallback_path"].endswith(
        "reviews/gold/run_id=run_reviews_demo_002/dataset_reviews_gold.jsonl"
    )
    assert catalog["lineage"]["run_id"] == "run_reviews_demo_002"


def test_week2_catalog_metadata_ignores_failed_run_after_success(tmp_path: Path) -> None:
    service = Week2WorkflowService(output_root=tmp_path / "out")
    first_run = service.trigger_run("pipeline_reviews_json_e2e", executor="local_runner", triggered_by="m5_owner")
    first_catalog = service.get_catalog_metadata("dataset_reviews_gold")
    service.local_runner = FailingRunner()

    failed_run = service.trigger_run("pipeline_reviews_json_e2e", executor="local_runner", triggered_by="m5_owner")
    catalog_after_failure = service.get_catalog_metadata("dataset_reviews_gold")

    assert first_run["status"] == "fallback_succeeded"
    assert first_catalog["lineage"]["run_id"] == "run_reviews_demo_001"
    assert failed_run["status"] == "fallback_failed"
    assert failed_run["run_id"] == "run_reviews_demo_002"
    assert catalog_after_failure["lineage"]["run_id"] == "run_reviews_demo_001"
    assert catalog_after_failure["s3_uri"] == first_catalog["s3_uri"]


def test_week2_airflow_executor_falls_back_when_adapter_unavailable() -> None:
    client = make_client()

    response = client.post(
        "/api/week2/workflows/pipeline_reviews_json_e2e/runs",
        json={"executor": "airflow", "triggered_by": "m5_owner"},
    )

    assert response.status_code == 201
    run = response.json()
    assert run["executor"] == "airflow"
    assert run["status"] == "fallback_succeeded"
    assert run["row_count"] == 4
    assert any("Airflow unavailable; falling back to local runner" in log["message"] for log in run["logs"])
    assert run["logs"][-1]["message"] == "airflow adapter fell back to local runner"


def test_week2_airflow_success_updates_catalog_without_local_fallback(tmp_path: Path) -> None:
    service = Week2WorkflowService(
        airflow_adapter=SuccessfulAirflowAdapter(tmp_path / "airflow" / "dataset_reviews_gold.jsonl"),
        local_runner=FailingRunner(),
        output_root=tmp_path / "out",
    )

    run = service.trigger_run("pipeline_reviews_json_e2e", executor="airflow", triggered_by="m5_owner")
    catalog = service.get_catalog_metadata("dataset_reviews_gold")

    assert run["executor"] == "airflow"
    assert run["status"] == "succeeded"
    assert run["row_count"] == 10
    assert run["bytes"] == 1000
    assert run["task_results"][0]["node_id"] == "airflow_dag_reviews"
    assert not any("falling back" in log["message"] for log in run["logs"])
    assert run["logs"][-1]["message"] == "airflow adapter executed Week 2 workflow boundary"
    assert catalog["lineage"]["run_id"] == "run_reviews_demo_001"
    assert catalog["metrics"]["row_count"] == 7
    assert catalog["metrics"]["bytes"] > 0
    assert catalog["storage"]["local_fallback_path"].endswith("dataset_reviews_gold.jsonl")


def test_week2_airflow_failed_result_uses_local_fallback(tmp_path: Path) -> None:
    service = Week2WorkflowService(
        airflow_adapter=FailedAirflowAdapter(),
        output_root=tmp_path / "out",
    )

    run = service.trigger_run("pipeline_reviews_json_e2e", executor="airflow", triggered_by="m5_owner")
    catalog = service.get_catalog_metadata("dataset_reviews_gold")

    assert run["status"] == "fallback_succeeded"
    assert run["row_count"] == 4
    assert any("Airflow returned failed; falling back to local runner" in log["message"] for log in run["logs"])
    assert catalog["lineage"]["run_id"] == "run_reviews_demo_001"


def test_week2_airflow_and_local_failure_do_not_update_catalog(tmp_path: Path) -> None:
    service = Week2WorkflowService(
        airflow_adapter=FailedAirflowAdapter(),
        local_runner=FailingRunner(),
        output_root=tmp_path / "out",
    )

    run = service.trigger_run("pipeline_reviews_json_e2e", executor="airflow", triggered_by="m5_owner")

    assert run["status"] == "fallback_failed"
    assert any("Airflow returned failed; falling back to local runner" in log["message"] for log in run["logs"])
    with pytest.raises(Week2WorkflowNotFoundError):
        service.get_catalog_metadata("dataset_reviews_gold")


def test_week2_workflow_routes_return_not_found_for_unknown_ids() -> None:
    client = make_client()

    run_response = client.post("/api/week2/workflows/missing/runs")
    get_run_response = client.get("/api/week2/runs/missing")
    catalog_response = client.get("/api/week2/catalog/missing")

    assert run_response.status_code == 404
    assert get_run_response.status_code == 404
    assert catalog_response.status_code == 404


class FailingRunner:
    def run(self, workflow_definition: dict, run_id: str) -> Week2RunnerResult:
        return Week2RunnerResult(
            status="fallback_failed",
            task_results=[
                {
                    "node_id": "node_load_reviews",
                    "status": "failed",
                    "attempt": 1,
                    "row_count": None,
                    "bytes": None,
                    "error": "forced failure",
                }
            ],
            logs=[{"level": "error", "message": "forced failure"}],
            duration_ms=1,
        )


class SuccessfulAirflowAdapter:
    def __init__(self, output_path: Path) -> None:
        self.output_path = output_path

    def run(self, workflow_definition: dict, run_id: str) -> Week2RunnerResult:
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        self.output_path.write_text('{"product_id": "B001", "review_count": 7}\n', encoding="utf-8")
        return Week2RunnerResult(
            status="succeeded",
            task_results=[
                {
                    "node_id": "airflow_dag_reviews",
                    "status": "succeeded",
                    "attempt": 1,
                    "row_count": 7,
                    "bytes": self.output_path.stat().st_size,
                    "error": None,
                }
            ],
            logs=[{"level": "info", "message": f"Airflow DAG completed for {run_id}"}],
            row_count=10,
            bytes=1000,
            duration_ms=2,
            output_path=str(self.output_path),
            output_row_count=7,
            output_bytes=self.output_path.stat().st_size,
        )


class FailedAirflowAdapter:
    def run(self, workflow_definition: dict, run_id: str) -> Week2RunnerResult:
        return Week2RunnerResult(
            status="failed",
            task_results=[
                {
                    "node_id": "airflow_dag_reviews",
                    "status": "failed",
                    "attempt": 1,
                    "row_count": None,
                    "bytes": None,
                    "error": "dag failed",
                }
            ],
            logs=[{"level": "error", "message": f"Airflow DAG failed for {run_id}"}],
            duration_ms=1,
        )
