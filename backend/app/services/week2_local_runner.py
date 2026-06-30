import json
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from time import perf_counter
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
    row_count: int | None = None
    bytes: int | None = None
    duration_ms: int | None = None
    output_path: str | None = None
    output_row_count: int | None = None
    output_bytes: int | None = None
    catalog_payload: dict[str, Any] | None = None


class Week2LocalRunner:
    def __init__(
        self,
        source_config: dict[str, Any] | None = None,
        schema_definition: dict[str, Any] | None = None,
        output_root: Path | None = None,
    ) -> None:
        self.source_config = source_config
        self.schema_definition = schema_definition
        self.output_root = output_root or (repo_root() / "data" / "week2")

    def run(self, workflow_definition: dict[str, Any], run_id: str = "run_reviews_demo_001") -> Week2RunnerResult:
        started = perf_counter()
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
                duration_ms=elapsed_ms(started),
            )

        task_results = []
        logs = [
            {"level": "info", "message": "queued"},
            {"level": "info", "message": "running"},
        ]
        rows: list[dict[str, Any]] = []
        output_path = None
        for node in workflow_definition["nodes"]:
            node_id = node["id"]
            node_type = node["type"]
            if node_type not in SUPPORTED_NODE_TYPES:
                task_results.append(failed_task_result(node_id, f"Unsupported node type: {node_type}"))
                logs.append({"level": "error", "message": f"{node_id} failed: unsupported node type {node_type}"})
                return Week2RunnerResult(
                    status="fallback_failed",
                    task_results=task_results,
                    logs=logs,
                    duration_ms=elapsed_ms(started),
                )

            try:
                rows, output_path = self._run_node(node, rows, run_id)
            except Week2LocalRunnerError as error:
                task_results.append(failed_task_result(node_id, str(error)))
                logs.append({"level": "error", "message": f"{node_id} failed: {error}"})
                return Week2RunnerResult(
                    status="fallback_failed",
                    task_results=task_results,
                    logs=logs,
                    row_count=len(rows) if rows else None,
                    duration_ms=elapsed_ms(started),
                    output_path=str(output_path) if output_path else None,
                )

            task_results.append(
                succeeded_task_result(node_id, row_count=len(rows), bytes=self._task_bytes(node_type, output_path))
            )
            logs.append({"level": "info", "message": f"{node_id} succeeded as {node_type}"})

        input_row_count = first_task_row_count(task_results)
        output_bytes = path_size(output_path)
        logs.append({"level": "info", "message": "fallback_succeeded"})
        return Week2RunnerResult(
            status="fallback_succeeded",
            task_results=task_results,
            logs=logs,
            row_count=input_row_count,
            bytes=self._source_bytes(),
            duration_ms=elapsed_ms(started),
            output_path=str(output_path) if output_path else None,
            output_row_count=len(rows),
            output_bytes=output_bytes,
        )

    def _missing_edge_refs(self, workflow_definition: dict[str, Any]) -> list[str]:
        node_ids = {node["id"] for node in workflow_definition["nodes"]}
        missing = {
            node_id
            for edge in workflow_definition.get("edges", [])
            for node_id in edge
            if node_id not in node_ids
        }
        return sorted(missing)

    def _run_node(
        self,
        node: dict[str, Any],
        rows: list[dict[str, Any]],
        run_id: str,
    ) -> tuple[list[dict[str, Any]], Path | None]:
        node_type = node["type"]
        if node_type == "Source":
            return self._read_source_rows(), None
        if node_type == "Select/Filter":
            return select_columns(rows, node.get("config", {}).get("columns", [])), None
        if node_type == "Cast/Normalize":
            return normalize_rows(rows, self.schema_definition), None
        if node_type == "Aggregate":
            return aggregate_rows(rows, node.get("config", {})), None
        if node_type == "Load":
            output_path = self._write_output_rows(rows, node["target_dataset"], run_id)
            return rows, output_path
        raise Week2LocalRunnerError(f"Unsupported node type: {node_type}")

    def _read_source_rows(self) -> list[dict[str, Any]]:
        if self.source_config is None:
            raise Week2LocalRunnerError("SourceConfig is required for local runner execution")

        source_path = self._source_path()
        if not source_path.exists():
            raise Week2LocalRunnerError(f"Source file not found: {source_path}")

        rows = []
        with source_path.open(encoding=self.source_config.get("options", {}).get("encoding", "utf-8")) as source_file:
            for line_number, line in enumerate(source_file, start=1):
                if not line.strip():
                    continue
                try:
                    rows.append(json.loads(line))
                except json.JSONDecodeError as error:
                    raise Week2LocalRunnerError(f"Invalid JSONL at line {line_number}: {error}") from error
        return rows

    def _source_path(self) -> Path:
        if self.source_config is None:
            raise Week2LocalRunnerError("SourceConfig is required for local runner execution")
        requested = Path(self.source_config["connection_ref"]["path"])
        if requested.is_absolute():
            candidates = [requested]
        else:
            root = repo_root()
            candidates = [
                root / requested,
                root / requested.name,
                root / "samples" / requested.name,
            ]

        for candidate in candidates:
            if candidate.exists():
                return candidate
        return candidates[0]

    def _source_bytes(self) -> int | None:
        if self.source_config is None:
            return None
        return path_size(self._source_path())

    def _task_bytes(self, node_type: str, output_path: Path | None) -> int | None:
        if node_type == "Source":
            return self._source_bytes()
        return path_size(output_path)

    def _write_output_rows(self, rows: list[dict[str, Any]], target_dataset: str, run_id: str) -> Path:
        output_dir = self.output_root / "reviews" / "gold" / f"run_id={run_id}"
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{target_dataset}.jsonl"
        with output_path.open("w", encoding="utf-8") as output_file:
            for row in rows:
                output_file.write(json.dumps(row, ensure_ascii=False, sort_keys=True))
                output_file.write("\n")
        return output_path


class Week2LocalRunnerError(ValueError):
    pass


def select_columns(rows: list[dict[str, Any]], columns: list[str]) -> list[dict[str, Any]]:
    if not columns:
        return rows
    return [{column: row.get(column) for column in columns} for row in rows]


def normalize_rows(rows: list[dict[str, Any]], schema_definition: dict[str, Any] | None) -> list[dict[str, Any]]:
    if schema_definition is None:
        return rows

    field_types = {field["path"]: field["type"] for field in schema_definition["fields"]}
    return [{key: cast_value(value, field_types.get(key)) for key, value in row.items()} for row in rows]


def aggregate_rows(rows: list[dict[str, Any]], config: dict[str, Any]) -> list[dict[str, Any]]:
    group_by = config.get("group_by", [])
    metrics = config.get("metrics", [])
    if not group_by or not metrics:
        return rows

    grouped: dict[tuple[Any, ...], list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        grouped[tuple(row.get(column) for column in group_by)].append(row)

    aggregated_rows = []
    for key, group_rows in grouped.items():
        aggregated_row = {column: value for column, value in zip(group_by, key)}
        for metric in metrics:
            if metric.get("operation") == "count":
                aggregated_row[metric["name"]] = len(group_rows)
        ratings = [row.get("rating") for row in group_rows if isinstance(row.get("rating"), int | float)]
        aggregated_row["average_rating"] = round(sum(ratings) / len(ratings), 2) if ratings else None
        aggregated_rows.append(aggregated_row)

    return sorted(aggregated_rows, key=lambda row: tuple(str(row.get(column)) for column in group_by))


def cast_value(value: Any, field_type: str | None) -> Any:
    if value is None or field_type is None:
        return value
    if field_type == "number":
        return float(value)
    if field_type == "boolean":
        return bool(value)
    return value


def succeeded_task_result(node_id: str, row_count: int | None = None, bytes: int | None = None) -> dict[str, Any]:
    return {
        "node_id": node_id,
        "status": "succeeded",
        "attempt": 1,
        "row_count": row_count,
        "bytes": bytes,
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


def repo_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / "contracts").is_dir():
            return parent
    return Path(__file__).resolve().parents[3]


def path_size(path: Path | None) -> int | None:
    return path.stat().st_size if path is not None and path.exists() else None


def elapsed_ms(started: float) -> int:
    return max(1, round((perf_counter() - started) * 1000))


def first_task_row_count(task_results: list[dict[str, Any]]) -> int | None:
    if not task_results:
        return None
    row_count = task_results[0].get("row_count")
    return row_count if isinstance(row_count, int) else None
