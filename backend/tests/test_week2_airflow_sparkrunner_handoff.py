import json
from argparse import Namespace
from pathlib import Path

from app.services.week2_airflow_adapter import Week2AirflowAdapter, Week2AirflowConfig

from scripts.week2_m2_airflow_sparkrunner_handoff import run_handoff


def test_m2_airflow_handoff_writes_result_artifact_readable_by_m5_adapter(tmp_path: Path) -> None:
    runtime_config_path = tmp_path / "runtime_config.json"
    output_root = tmp_path / "week2"
    result_path = tmp_path / "_airflow_results" / "run_airflow_spark_001.json"
    runtime_config_path.write_text(
        json.dumps(
            {
                "runner": "spark_runner",
                "input_format": "jsonl",
                "input_path": "backend/samples/amazon_reviews_demo.jsonl",
                "output_format": "parquet",
                "output_root": str(output_root),
                "options": {"output_file_name": "dataset_reviews_gold.parquet"},
            }
        ),
        encoding="utf-8",
    )

    artifact = run_handoff(
        Namespace(
            runtime_config_path=runtime_config_path,
            runtime_profile=None,
            output_root=None,
            result_path=result_path,
            run_id="run_airflow_spark_001",
        )
    )

    assert artifact["run_id"] == "run_airflow_spark_001"
    assert result_path.exists()
    payload = json.loads(result_path.read_text(encoding="utf-8"))
    result_payload = payload["week2_result"]
    assert result_payload["status"] == "succeeded"
    assert result_payload["row_count"] == 4
    assert result_payload["output_row_count"] == 4
    assert Path(result_payload["output_path"]).exists()
    assert [task["node_id"] for task in result_payload["task_results"]] == ["spark_read", "spark_write"]

    adapter = Week2AirflowAdapter(
        config=Week2AirflowConfig(
            base_url="http://airflow.local",
            dag_id="asklake_week2_reviews",
            result_root=result_path.parent,
            max_polls=1,
            poll_interval_seconds=0,
        ),
        http_client=FakeAirflowHttpClient(
            [
                {
                    "dag_run_id": "run_airflow_spark_001",
                    "state": "queued",
                },
                {
                    "dag_run_id": "run_airflow_spark_001",
                    "state": "success",
                    "conf": {"airflow_result_file": result_path.name},
                }
            ]
        ),
    )

    result = adapter.run({"pipeline_id": "pipeline_reviews_json_e2e"}, run_id="run_airflow_spark_001")

    assert result.status == "succeeded"
    assert result.output_path == result_payload["output_path"]
    assert result.output_row_count == 4


class FakeAirflowHttpClient:
    def __init__(self, responses: list[dict]) -> None:
        self.responses = list(responses)

    def request(self, method: str, path: str, payload: dict | None = None) -> dict:
        return self.responses.pop(0)
