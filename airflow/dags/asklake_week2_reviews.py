from __future__ import annotations

import json
import os
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from time import perf_counter
from typing import Any

from airflow.decorators import dag, task
from airflow.operators.python import get_current_context


DEFAULT_DAG_ID = "asklake_week2_reviews"


@dag(
    dag_id=DEFAULT_DAG_ID,
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["asklake", "week2", "m5"],
)
def asklake_week2_reviews() -> None:
    @task(task_id="run_reviews_workflow")
    def run_reviews_workflow() -> dict[str, Any]:
        context = get_current_context()
        dag_run = context["dag_run"]
        conf = dag_run.conf or {}
        run_id = str(conf.get("run_id") or dag_run.run_id)
        workflow_definition = conf.get("workflow_definition") or load_contract("workflow_definition.sample.json")
        source_config = load_contract("source_config.sample.json")
        schema_definition = load_contract("schema_definition.sample.json")

        result = execute_reviews_workflow(
            workflow_definition=workflow_definition,
            source_config=source_config,
            schema_definition=schema_definition,
            run_id=run_id,
        )
        write_result_artifact(conf, run_id, result)
        return result

    run_reviews_workflow()


def execute_reviews_workflow(
    workflow_definition: dict[str, Any],
    source_config: dict[str, Any],
    schema_definition: dict[str, Any],
    run_id: str,
) -> dict[str, Any]:
    started = perf_counter()
    rows: list[dict[str, Any]] = []
    output_path: Path | None = None
    task_results: list[dict[str, Any]] = []
    logs = [
        {"level": "info", "message": "queued"},
        {"level": "info", "message": "running"},
    ]

    source_path = source_file_path(source_config)
    for node in workflow_definition["nodes"]:
        node_id = node["id"]
        node_type = node["type"]
        if node_type == "Source":
            rows = read_jsonl_rows(source_path, source_config)
            task_results.append(succeeded_task_result(node_id, len(rows), path_size(source_path)))
        elif node_type == "Select/Filter":
            rows = select_columns(rows, node.get("config", {}).get("columns", []))
            task_results.append(succeeded_task_result(node_id, len(rows), None))
        elif node_type == "Cast/Normalize":
            rows = normalize_rows(rows, schema_definition)
            task_results.append(succeeded_task_result(node_id, len(rows), None))
        elif node_type == "Aggregate":
            rows = aggregate_rows(rows, node.get("config", {}))
            task_results.append(succeeded_task_result(node_id, len(rows), None))
        elif node_type == "Load":
            output_path = write_output_rows(rows, node["target_dataset"], run_id)
            task_results.append(succeeded_task_result(node_id, len(rows), path_size(output_path)))
        else:
            raise ValueError(f"Unsupported Week 2 DAG node type: {node_type}")
        logs.append({"level": "info", "message": f"{node_id} succeeded as {node_type}"})

    output_bytes = path_size(output_path)
    logs.append({"level": "info", "message": f"Airflow DAG completed for {run_id}"})
    return {
        "status": "succeeded",
        "task_results": task_results,
        "logs": logs,
        "row_count": first_task_row_count(task_results),
        "bytes": path_size(source_path),
        "duration_ms": elapsed_ms(started),
        "output_path": backend_visible_output_path(output_path),
        "output_row_count": len(rows),
        "output_bytes": output_bytes,
    }


def load_contract(file_name: str) -> dict[str, Any]:
    with (repo_root() / "contracts" / file_name).open(encoding="utf-8") as contract_file:
        return json.load(contract_file)


def source_file_path(source_config: dict[str, Any]) -> Path:
    requested = Path(source_config["connection_ref"]["path"])
    if requested.is_absolute():
        return requested
    return repo_root() / requested


def read_jsonl_rows(source_path: Path, source_config: dict[str, Any]) -> list[dict[str, Any]]:
    rows = []
    with source_path.open(encoding=source_config.get("options", {}).get("encoding", "utf-8")) as source_file:
        for line_number, line in enumerate(source_file, start=1):
            if not line.strip():
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as error:
                raise ValueError(f"Invalid JSONL at line {line_number}: {error}") from error
    return rows


def select_columns(rows: list[dict[str, Any]], columns: list[str]) -> list[dict[str, Any]]:
    if not columns:
        return rows
    return [{column: row.get(column) for column in columns} for row in rows]


def normalize_rows(rows: list[dict[str, Any]], schema_definition: dict[str, Any]) -> list[dict[str, Any]]:
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


def write_output_rows(rows: list[dict[str, Any]], target_dataset: str, run_id: str) -> Path:
    output_path = data_root() / "reviews" / "gold" / f"run_id={run_id}" / f"{target_dataset}.jsonl"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as output_file:
        for row in rows:
            output_file.write(json.dumps(row, ensure_ascii=False, sort_keys=True))
            output_file.write("\n")
    return output_path


def write_result_artifact(conf: dict[str, Any], run_id: str, result: dict[str, Any]) -> Path:
    result_file = Path(str(conf.get("airflow_result_file") or f"{run_id}.json")).name
    result_path = data_root() / "_airflow_results" / result_file
    result_path.parent.mkdir(parents=True, exist_ok=True)
    with result_path.open("w", encoding="utf-8") as result_file_handle:
        json.dump({"run_id": run_id, "week2_result": result}, result_file_handle, ensure_ascii=False, indent=2)
        result_file_handle.write("\n")
    return result_path


def backend_visible_output_path(output_path: Path | None) -> str | None:
    if output_path is None:
        return None
    relative_path = output_path.relative_to(data_root())
    prefix = os.getenv("ASKLAKE_WEEK2_AIRFLOW_OUTPUT_PATH_PREFIX", "data/week2").strip("/")
    if prefix:
        return str(Path(prefix) / relative_path)
    return str(relative_path)


def cast_value(value: Any, field_type: str | None) -> Any:
    if value is None or field_type is None:
        return value
    if field_type == "number":
        return float(value)
    if field_type == "boolean":
        return bool(value)
    return value


def succeeded_task_result(node_id: str, row_count: int | None, bytes_read: int | None) -> dict[str, Any]:
    return {
        "node_id": node_id,
        "status": "succeeded",
        "attempt": 1,
        "row_count": row_count,
        "bytes": bytes_read,
        "error": None,
    }


def first_task_row_count(task_results: list[dict[str, Any]]) -> int | None:
    if not task_results:
        return None
    row_count = task_results[0].get("row_count")
    return row_count if isinstance(row_count, int) else None


def path_size(path: Path | None) -> int | None:
    return path.stat().st_size if path is not None and path.exists() else None


def elapsed_ms(started: float) -> int:
    return max(1, round((perf_counter() - started) * 1000))


def repo_root() -> Path:
    return Path(os.getenv("ASKLAKE_REPO_ROOT", "/opt/asklake"))


def data_root() -> Path:
    return Path(os.getenv("ASKLAKE_WEEK2_AIRFLOW_DATA_ROOT", str(repo_root() / "data" / "week2")))


asklake_week2_reviews()
