import json
import re
from copy import deepcopy
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


class Week2WorkflowNotFoundError(ValueError):
    pass


class Week2WorkflowService:
    def __init__(self, contracts_dir: Path | None = None) -> None:
        self.contracts_dir = contracts_dir or default_contracts_dir()
        self.workflow_definition = self._load_contract("workflow_definition.sample.json")
        self.execution_template = self._load_contract("execution_result.sample.json")
        self.catalog_template = self._load_contract("catalog_metadata.sample.json")
        self.runs: dict[str, dict[str, Any]] = {}
        self.catalog: dict[str, dict[str, Any]] = {
            self.catalog_template["dataset_id"]: deepcopy(self.catalog_template)
        }
        self.sequence = 0

    def trigger_run(self, pipeline_id: str, executor: str, triggered_by: str) -> dict[str, Any]:
        if pipeline_id != self.workflow_definition["pipeline_id"]:
            raise Week2WorkflowNotFoundError("Week 2 workflow not found")

        self.sequence += 1
        run_id = f"run_reviews_demo_{self.sequence:03d}"
        timestamp = now_iso()
        status = "succeeded" if executor == "airflow" else "fallback_succeeded"

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
        run["task_results"] = [self._task_result_for_node(node) for node in self.workflow_definition["nodes"]]
        run["logs"] = [
            {
                "level": "info",
                "message": f"{executor} completed Week 2 fixture workflow with shared ExecutionResult shape",
            }
        ]

        catalog = self._catalog_for_run(run_id, timestamp)
        self.runs[run_id] = run
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

    def _load_contract(self, file_name: str) -> dict[str, Any]:
        path = self.contracts_dir / file_name
        with path.open(encoding="utf-8") as contract_file:
            return json.load(contract_file)

    def _output_for_run(self, output: dict[str, Any], run_id: str) -> dict[str, Any]:
        updated_output = deepcopy(output)
        updated_output["uri"] = replace_run_id(updated_output["uri"], run_id)
        return updated_output

    def _task_result_for_node(self, node: dict[str, Any]) -> dict[str, Any]:
        return {
            "node_id": node["id"],
            "status": "succeeded",
            "attempt": 1,
            "row_count": None,
            "bytes": None,
            "error": None,
        }

    def _catalog_for_run(self, run_id: str, timestamp: str) -> dict[str, Any]:
        catalog = deepcopy(self.catalog_template)
        catalog["s3_uri"] = replace_run_id(catalog["s3_uri"], run_id)
        catalog["storage"]["prefix"] = replace_run_id(catalog["storage"]["prefix"], run_id)
        catalog["lineage"]["run_id"] = run_id
        catalog["updated_at"] = timestamp
        return catalog


def default_contracts_dir() -> Path:
    return Path(__file__).resolve().parents[3] / "contracts"


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


def replace_run_id(value: str, run_id: str) -> str:
    return re.sub(r"run_id=[^/]+", f"run_id={run_id}", value)
