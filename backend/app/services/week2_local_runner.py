from dataclasses import dataclass
from typing import Any


SUPPORTED_NODE_TYPES = {
    "Source",
    "Select/Filter",
    "Cast/Normalize",
    "Aggregate",
    "Load",
}


@dataclass(frozen=True)
class Week2RunnerResult:
    status: str
    task_results: list[dict[str, Any]]
    logs: list[dict[str, str]]


class Week2LocalRunner:
    def run(self, workflow_definition: dict[str, Any]) -> Week2RunnerResult:
        missing_edge_refs = self._missing_edge_refs(workflow_definition)
        if missing_edge_refs:
            return Week2RunnerResult(
                status="fallback_failed",
                task_results=[],
                logs=[
                    {"level": "info", "message": "queued"},
                    {"level": "info", "message": "running"},
                    {
                        "level": "error",
                        "message": f"Workflow edge references unknown node(s): {', '.join(missing_edge_refs)}",
                    },
                ],
            )

        task_results = []
        logs = [
            {"level": "info", "message": "queued"},
            {"level": "info", "message": "running"},
        ]
        for node in workflow_definition["nodes"]:
            node_id = node["id"]
            node_type = node["type"]
            if node_type not in SUPPORTED_NODE_TYPES:
                task_results.append(failed_task_result(node_id, f"Unsupported node type: {node_type}"))
                logs.append({"level": "error", "message": f"{node_id} failed: unsupported node type {node_type}"})
                return Week2RunnerResult(status="fallback_failed", task_results=task_results, logs=logs)

            task_results.append(succeeded_task_result(node_id))
            logs.append({"level": "info", "message": f"{node_id} succeeded as {node_type}"})

        logs.append({"level": "info", "message": "fallback_succeeded"})
        return Week2RunnerResult(status="fallback_succeeded", task_results=task_results, logs=logs)

    def _missing_edge_refs(self, workflow_definition: dict[str, Any]) -> list[str]:
        node_ids = {node["id"] for node in workflow_definition["nodes"]}
        missing = {
            node_id
            for edge in workflow_definition.get("edges", [])
            for node_id in edge
            if node_id not in node_ids
        }
        return sorted(missing)


def succeeded_task_result(node_id: str) -> dict[str, Any]:
    return {
        "node_id": node_id,
        "status": "succeeded",
        "attempt": 1,
        "row_count": None,
        "bytes": None,
        "error": None,
    }


def failed_task_result(node_id: str, error: str) -> dict[str, Any]:
    return {
        "node_id": node_id,
        "status": "failed",
        "attempt": 1,
        "row_count": None,
        "bytes": None,
        "error": error,
    }
