import pytest

from app.services.week2_airflow_adapter import (
    Week2AirflowAdapter,
    Week2AirflowConfig,
    Week2AirflowUnavailableError,
)
from app.services.week2_local_runner import Week2RunnerResult
from app.services.week2_workflow import Week2WorkflowService


def test_week2_airflow_adapter_requires_configuration() -> None:
    adapter = Week2AirflowAdapter(config=None, env={})

    with pytest.raises(Week2AirflowUnavailableError, match="not configured"):
        adapter.run({"pipeline_id": "pipeline_reviews_json_e2e"}, run_id="run_reviews_demo_001")


def test_week2_airflow_adapter_triggers_dag_and_converts_week2_result() -> None:
    http_client = FakeAirflowHttpClient(
        [
            {"dag_run_id": "run_reviews_demo_001", "state": "queued"},
            {
                "dag_run_id": "run_reviews_demo_001",
                "state": "success",
                "conf": {
                    "week2_result": {
                        "status": "succeeded",
                        "task_results": [
                            {
                                "node_id": "airflow_dag_reviews",
                                "status": "succeeded",
                                "attempt": 1,
                                "row_count": 3,
                                "bytes": 195,
                                "error": None,
                            }
                        ],
                        "logs": [{"level": "info", "message": "Airflow DAG completed"}],
                        "row_count": 4,
                        "bytes": 580,
                        "duration_ms": 12,
                        "output_path": "/tmp/week2/reviews/gold/run_id=run_reviews_demo_001/dataset_reviews_gold.jsonl",
                        "output_row_count": 3,
                        "output_bytes": 195,
                    }
                },
            },
        ]
    )
    adapter = Week2AirflowAdapter(config=airflow_config(max_polls=1), http_client=http_client)

    result = adapter.run({"pipeline_id": "pipeline_reviews_json_e2e"}, run_id="run_reviews_demo_001")

    assert result == Week2RunnerResult(
        status="succeeded",
        task_results=[
            {
                "node_id": "airflow_dag_reviews",
                "status": "succeeded",
                "attempt": 1,
                "row_count": 3,
                "bytes": 195,
                "error": None,
            }
        ],
        logs=[{"level": "info", "message": "Airflow DAG completed"}],
        row_count=4,
        bytes=580,
        duration_ms=12,
        output_path="/tmp/week2/reviews/gold/run_id=run_reviews_demo_001/dataset_reviews_gold.jsonl",
        output_row_count=3,
        output_bytes=195,
    )
    assert http_client.requests == [
        (
            "POST",
            "/api/v1/dags/asklake_week2_reviews/dagRuns",
            {
                "dag_run_id": "run_reviews_demo_001",
                "conf": {
                    "run_id": "run_reviews_demo_001",
                    "pipeline_id": "pipeline_reviews_json_e2e",
                    "workflow_definition": {"pipeline_id": "pipeline_reviews_json_e2e"},
                },
            },
        ),
        ("GET", "/api/v1/dags/asklake_week2_reviews/dagRuns/run_reviews_demo_001", None),
    ]


def test_week2_airflow_adapter_marks_success_without_result_as_failed() -> None:
    http_client = FakeAirflowHttpClient(
        [
            {"dag_run_id": "run_reviews_demo_001", "state": "queued"},
            {"dag_run_id": "run_reviews_demo_001", "state": "success", "conf": {}},
        ]
    )
    adapter = Week2AirflowAdapter(config=airflow_config(max_polls=1), http_client=http_client)

    result = adapter.run({"pipeline_id": "pipeline_reviews_json_e2e"}, run_id="run_reviews_demo_001")

    assert result.status == "failed"
    assert result.task_results[0]["status"] == "failed"
    assert "missing Week 2 result payload" in result.task_results[0]["error"]
    assert any("missing Week 2 result payload" in log["message"] for log in result.logs)


def test_week2_workflow_uses_airflow_adapter_result_without_local_fallback(tmp_path) -> None:
    output_path = tmp_path / "airflow" / "dataset_reviews_gold.jsonl"
    output_path.parent.mkdir(parents=True)
    output_path.write_text('{"product_id": "B001", "review_count": 3}\n', encoding="utf-8")
    http_client = FakeAirflowHttpClient(
        [
            {"dag_run_id": "run_reviews_demo_001", "state": "queued"},
            {
                "dag_run_id": "run_reviews_demo_001",
                "state": "success",
                "week2_result": {
                    "status": "succeeded",
                    "task_results": [
                        {
                            "node_id": "airflow_dag_reviews",
                            "status": "succeeded",
                            "attempt": 1,
                            "row_count": 1,
                            "bytes": output_path.stat().st_size,
                            "error": None,
                        }
                    ],
                    "logs": [{"level": "info", "message": "Airflow DAG completed"}],
                    "row_count": 4,
                    "bytes": 580,
                    "duration_ms": 12,
                    "output_path": str(output_path),
                    "output_row_count": 1,
                    "output_bytes": output_path.stat().st_size,
                },
            },
        ]
    )
    service = Week2WorkflowService(
        airflow_adapter=Week2AirflowAdapter(config=airflow_config(max_polls=1), http_client=http_client),
        local_runner=FailingRunner(),
        output_root=tmp_path / "out",
    )

    run = service.trigger_run("pipeline_reviews_json_e2e", executor="airflow", triggered_by="m5_owner")
    catalog = service.get_catalog_metadata("dataset_reviews_gold")

    assert run["status"] == "succeeded"
    assert run["task_results"][0]["node_id"] == "airflow_dag_reviews"
    assert run["logs"][-1]["message"] == "airflow adapter executed Week 2 workflow boundary"
    assert catalog["lineage"]["run_id"] == "run_reviews_demo_001"
    assert catalog["metrics"]["row_count"] == 1
    assert catalog["metrics"]["bytes"] == output_path.stat().st_size
    assert catalog["storage"]["local_fallback_path"] == str(output_path)


def airflow_config(max_polls: int = 3) -> Week2AirflowConfig:
    return Week2AirflowConfig(
        base_url="http://airflow.local",
        dag_id="asklake_week2_reviews",
        max_polls=max_polls,
        poll_interval_seconds=0,
    )


class FakeAirflowHttpClient:
    def __init__(self, responses: list[dict]) -> None:
        self.responses = list(responses)
        self.requests = []

    def request(self, method: str, path: str, payload: dict | None = None) -> dict:
        self.requests.append((method, path, payload))
        return self.responses.pop(0)


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
