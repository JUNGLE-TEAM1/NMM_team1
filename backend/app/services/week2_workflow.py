import json
import re
from copy import deepcopy
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.services.week2_airflow_adapter import Week2AirflowAdapter, Week2AirflowError
from app.services.week2_local_runner import Week2LocalRunner, Week2RunnerResult

SUCCESSFUL_RUN_STATUSES = {"succeeded", "fallback_succeeded"}
AIRFLOW_SUCCESS_STATUS = "succeeded"


class Week2WorkflowNotFoundError(ValueError):
    pass


class Week2WorkflowService:
    def __init__(
        self,
        contracts_dir: Path | None = None,
        airflow_adapter: Week2AirflowAdapter | None = None,
        local_runner: Week2LocalRunner | None = None,
        output_root: Path | None = None,
    ) -> None:
        self.contracts_dir = contracts_dir or default_contracts_dir()
        self.source_config = self._load_contract("source_config.sample.json")
        self.schema_definition = self._load_contract("schema_definition.sample.json")
        self.workflow_definition = self._load_contract("workflow_definition.sample.json")
        self.execution_template = self._load_contract("execution_result.sample.json")
        self.catalog_template = self._load_contract("catalog_metadata.sample.json")
        self.airflow_adapter = airflow_adapter or Week2AirflowAdapter()
        self.local_runner = local_runner or Week2LocalRunner(
            source_config=self.source_config,
            schema_definition=self.schema_definition,
            output_root=output_root,
        )
        self.runs: dict[str, dict[str, Any]] = {}
        self.catalog: dict[str, dict[str, Any]] = {}
        self.sequence = 0

    def trigger_run(self, pipeline_id: str, executor: str, triggered_by: str) -> dict[str, Any]:
        if pipeline_id != self.workflow_definition["pipeline_id"]:
            raise Week2WorkflowNotFoundError("Week 2 workflow not found")

        self.sequence += 1
        run_id = f"run_reviews_demo_{self.sequence:03d}"
        timestamp = now_iso()
        runner_result = self._run_with_executor(executor, run_id)
        status = runner_result.status

        run = deepcopy(self.execution_template)
        run["run_id"] = run_id
        run["pipeline_id"] = pipeline_id
        run["executor"] = executor
        run["status"] = status
        run["triggered_by"] = triggered_by
        run["timestamps"] = {
            "started_at": timestamp,
            "finished_at": timestamp,
        }
        run["outputs"] = [self._output_for_run(output, run_id) for output in run["outputs"]]
        run["row_count"] = runner_result.row_count
        run["bytes"] = runner_result.bytes
        run["duration_ms"] = runner_result.duration_ms
        run["task_results"] = runner_result.task_results
        run["logs"] = self._logs_for_executor(executor, status, runner_result.logs)

        self.runs[run_id] = run
        if status in SUCCESSFUL_RUN_STATUSES:
            catalog = self._catalog_for_run(run_id, timestamp, runner_result)
            self.catalog[catalog["dataset_id"]] = catalog
        return run

    def get_run(self, run_id: str) -> dict[str, Any]:
        run = self.runs.get(run_id)
        if run is None:
            raise Week2WorkflowNotFoundError("Week 2 run not found")
        return run

    def get_catalog_metadata(self, dataset_id: str) -> dict[str, Any]:
        catalog = self.catalog.get(dataset_id)
        if catalog is None:
            raise Week2WorkflowNotFoundError("Week 2 catalog metadata not found")
        return catalog

    def _run_with_executor(self, executor: str, run_id: str) -> Week2RunnerResult:
        if executor == "local_runner":
            return self.local_runner.run(self.workflow_definition, run_id=run_id)

        try:
            airflow_result = self.airflow_adapter.run(self.workflow_definition, run_id=run_id)
        except Week2AirflowError as error:
            fallback_result = self.local_runner.run(self.workflow_definition, run_id=run_id)
            return result_with_logs(
                fallback_result,
                [
                    {
                        "level": "warning",
                        "message": f"Airflow unavailable; falling back to local runner: {error}",
                    }
                ],
            )

        if should_fallback_to_local_runner(airflow_result):
            fallback_result = self.local_runner.run(self.workflow_definition, run_id=run_id)
            return result_with_logs(
                fallback_result,
                airflow_result.logs
                + [
                    {
                        "level": "warning",
                        "message": f"Airflow returned {airflow_result.status}; falling back to local runner",
                    }
                ],
            )

        return airflow_result

    def _load_contract(self, file_name: str) -> dict[str, Any]:
        path = self.contracts_dir / file_name
        with path.open(encoding="utf-8") as contract_file:
            return json.load(contract_file)

    def _output_for_run(self, output: dict[str, Any], run_id: str) -> dict[str, Any]:
        updated_output = deepcopy(output)
        updated_output["uri"] = replace_run_id(updated_output["uri"], run_id)
        return updated_output

    def _catalog_for_run(self, run_id: str, timestamp: str, runner_result: Any) -> dict[str, Any]:
        catalog = deepcopy(self.catalog_template)
        catalog["s3_uri"] = replace_run_id(catalog["s3_uri"], run_id)
        catalog["storage"]["prefix"] = replace_run_id(catalog["storage"]["prefix"], run_id)
        catalog["storage"]["local_fallback_path"] = runner_result.output_path
        catalog["metrics"]["row_count"] = runner_result.row_count
        catalog["metrics"]["bytes"] = runner_result.bytes
        catalog["metrics"]["quality"]["schema_match"] = "passed"
        catalog["metrics"]["quality"]["row_count_checked"] = runner_result.row_count is not None
        catalog["lineage"]["run_id"] = run_id
        catalog["updated_at"] = timestamp
        return catalog

    def _logs_for_executor(
        self,
        executor: str,
        status: str,
        runner_logs: list[dict[str, str]],
    ) -> list[dict[str, str]]:
        logs = deepcopy(runner_logs)
        if executor == "airflow" and status == AIRFLOW_SUCCESS_STATUS:
            logs.append({"level": "info", "message": "airflow adapter executed Week 2 workflow boundary"})
        elif executor == "airflow":
            logs.append({"level": "info", "message": "airflow adapter fell back to local runner"})
        else:
            logs.append({"level": "info", "message": "local runner executed Week 2 workflow boundary"})
        return logs


def default_contracts_dir() -> Path:
    return Path(__file__).resolve().parents[3] / "contracts"


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


def replace_run_id(value: str, run_id: str) -> str:
    return re.sub(r"run_id=[^/]+", f"run_id={run_id}", value)


def should_fallback_to_local_runner(airflow_result: Week2RunnerResult) -> bool:
    return airflow_result.status != AIRFLOW_SUCCESS_STATUS


def result_with_logs(result: Week2RunnerResult, leading_logs: list[dict[str, str]]) -> Week2RunnerResult:
    return Week2RunnerResult(
        status=result.status,
        task_results=result.task_results,
        logs=leading_logs + result.logs,
        row_count=result.row_count,
        bytes=result.bytes,
        duration_ms=result.duration_ms,
        output_path=result.output_path,
    )
