import json
from pathlib import Path

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
                    "airflow_result_file": "run_reviews_demo_001.json",
                },
            },
        ),
        ("GET", "/api/v1/dags/asklake_week2_reviews/dagRuns/run_reviews_demo_001", None),
    ]


def test_week2_airflow_adapter_routes_product_health_to_product_health_dag() -> None:
    http_client = FakeAirflowHttpClient(
        [
            {"dag_run_id": "run_product_health_demo_001", "state": "queued"},
            {
                "dag_run_id": "run_product_health_demo_001",
                "state": "success",
                "week2_result": {
                    "status": "succeeded",
                    "task_results": [
                        {
                            "node_id": "node_load_product_health_gold",
                            "status": "succeeded",
                            "attempt": 1,
                            "row_count": 3,
                            "bytes": 2048,
                            "error": None,
                        }
                    ],
                    "logs": [{"level": "info", "message": "Airflow product-health DAG completed"}],
                    "row_count": 3367,
                    "bytes": 55296,
                    "duration_ms": 25,
                    "output_path": "data/week2/product_health/gold/run_id=run_product_health_demo_001/dataset_product_health_gold.parquet",
                    "output_row_count": 3,
                    "output_bytes": 2048,
                },
            },
        ]
    )
    adapter = Week2AirflowAdapter(
        config=airflow_config(
            max_polls=1,
            dag_ids_by_pipeline={"pipeline_product_health_e2e": "asklake_week2_product_health"},
        ),
        http_client=http_client,
    )

    result = adapter.run(
        {"pipeline_id": "pipeline_product_health_e2e"},
        run_id="run_product_health_demo_001",
    )

    assert result.status == "succeeded"
    assert result.output_row_count == 3
    assert http_client.requests[0][1] == "/api/v1/dags/asklake_week2_product_health/dagRuns"
    assert http_client.requests[1][1] == (
        "/api/v1/dags/asklake_week2_product_health/dagRuns/run_product_health_demo_001"
    )


def test_week2_airflow_adapter_reads_shared_result_artifact(tmp_path: Path) -> None:
    result_root = tmp_path / "_airflow_results"
    result_root.mkdir()
    output_path = tmp_path / "reviews" / "gold" / "run_id=run_reviews_demo_001" / "dataset_reviews_gold.jsonl"
    output_path.parent.mkdir(parents=True)
    output_path.write_text('{"product_id": "B001", "review_count": 3}\n', encoding="utf-8")
    artifact_path = result_root / "run_reviews_demo_001.json"
    artifact_path.write_text(
        json.dumps(
            {
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
                "logs": [{"level": "info", "message": "Airflow result artifact completed"}],
                "row_count": 4,
                "bytes": 580,
                "duration_ms": 14,
                "output_path": str(output_path),
                "output_row_count": 1,
                "output_bytes": output_path.stat().st_size,
            }
        ),
        encoding="utf-8",
    )
    http_client = FakeAirflowHttpClient(
        [
            {"dag_run_id": "run_reviews_demo_001", "state": "queued"},
            {
                "dag_run_id": "run_reviews_demo_001",
                "state": "success",
                "conf": {"airflow_result_file": "run_reviews_demo_001.json"},
            },
        ]
    )
    adapter = Week2AirflowAdapter(
        config=airflow_config(max_polls=1, result_root=result_root),
        http_client=http_client,
    )

    result = adapter.run({"pipeline_id": "pipeline_reviews_json_e2e"}, run_id="run_reviews_demo_001")

    assert result.status == "succeeded"
    assert result.output_path == str(output_path)
    assert result.output_row_count == 1
    assert result.output_bytes == output_path.stat().st_size
    assert result.logs == [{"level": "info", "message": "Airflow result artifact completed"}]
    assert http_client.requests[0][2]["conf"]["airflow_result_file"] == "run_reviews_demo_001.json"


def test_week2_airflow_adapter_preserves_manual_run_catalog_payload() -> None:
    catalog_payload = {
        "dataset_id": "dataset_reviews_gold",
        "name": "Amazon Reviews Gold",
        "layer": "gold",
        "query_table": "reviews_gold",
        "storage_uri": (
            "s3://manual-bucket/reviews/gold/run_id=run_reviews_demo_001/dataset_reviews_gold.parquet"
        ),
        "format": "parquet",
        "schema": {
            "fields": [
                {"name": "product_id", "type": "string", "nullable": False},
                {"name": "review_count", "type": "integer", "nullable": False},
            ]
        },
        "row_count": 2,
        "quality_summary": {"schema_match": "passed", "row_count_checked": True},
        "lineage": {"run_id": "run_reviews_demo_001", "source_ids": ["source_amazon_reviews_demo"]},
        "m3_contract_refs": ["contracts/schema_definition.sample.json", "contracts/transform_spec.sample.json"],
    }
    http_client = FakeAirflowHttpClient(
        [
            {"dag_run_id": "run_reviews_demo_001", "state": "queued"},
            {
                "dag_run_id": "run_reviews_demo_001",
                "state": "success",
                "week2_result": {
                    "status": "succeeded",
                    "row_count": 4,
                    "bytes": 580,
                    "duration_ms": 12,
                    "output_row_count": 2,
                    "output_bytes": 2048,
                    "catalog_payload": catalog_payload,
                },
            },
        ]
    )
    adapter = Week2AirflowAdapter(config=airflow_config(max_polls=1), http_client=http_client)

    result = adapter.run({"pipeline_id": "pipeline_reviews_json_e2e"}, run_id="run_reviews_demo_001")

    assert result.status == "succeeded"
    assert result.output_path is None
    assert result.catalog_payload == catalog_payload


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


def airflow_config(
    max_polls: int = 3,
    result_root: Path | None = None,
    dag_ids_by_pipeline: dict[str, str] | None = None,
) -> Week2AirflowConfig:
    return Week2AirflowConfig(
        base_url="http://airflow.local",
        dag_id="asklake_week2_reviews",
        result_root=result_root or Path("/tmp/week2/_airflow_results"),
        dag_ids_by_pipeline=dag_ids_by_pipeline,
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
