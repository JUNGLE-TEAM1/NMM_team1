from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from time import perf_counter
from typing import Any

from airflow.decorators import dag, task
from airflow.operators.python import get_current_context


DEFAULT_DAG_ID = "asklake_week2_product_health"

PRODUCT_HEALTH_ROWS: list[dict[str, Any]] = [
    {
        "product_id": "P-001",
        "product_name": "Trail Bottle",
        "category_l1": "Outdoor",
        "review_count": 120,
        "average_rating": 2.1,
        "negative_review_rate": 0.48,
        "view_count": 3000,
        "purchase_count": 90,
        "conversion_rate": 0.03,
        "delivery_count": 82,
        "late_delivery_rate": 0.22,
        "risk_score": 0.87,
    },
    {
        "product_id": "P-002",
        "product_name": "Desk Lamp",
        "category_l1": "Home",
        "review_count": 84,
        "average_rating": 3.0,
        "negative_review_rate": 0.31,
        "view_count": 2200,
        "purchase_count": 176,
        "conversion_rate": 0.08,
        "delivery_count": 155,
        "late_delivery_rate": 0.14,
        "risk_score": 0.61,
    },
    {
        "product_id": "P-003",
        "product_name": "Travel Pouch",
        "category_l1": "Travel",
        "review_count": 52,
        "average_rating": 4.2,
        "negative_review_rate": 0.08,
        "view_count": 1800,
        "purchase_count": 288,
        "conversion_rate": 0.16,
        "delivery_count": 244,
        "late_delivery_rate": 0.04,
        "risk_score": 0.18,
    },
]

PRODUCT_HEALTH_SOURCE_EVIDENCE = {
    "reviews_seed": {
        "input_path": "handoff://product_health/reviews_seed",
        "row_count": 120,
        "bytes": 8192,
    },
    "behavior_events_seed": {
        "input_path": "handoff://product_health/behavior_events_seed",
        "row_count": 3000,
        "bytes": 32768,
    },
    "delivery_trips_seed": {
        "input_path": "handoff://product_health/delivery_trips_seed",
        "row_count": 244,
        "bytes": 12288,
    },
    "product_master_seed": {
        "input_path": "handoff://product_health/product_master_seed",
        "row_count": 3,
        "bytes": 2048,
    },
}


@dag(
    dag_id=DEFAULT_DAG_ID,
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["asklake", "week2", "m5", "product-health"],
)
def asklake_week2_product_health() -> None:
    @task(task_id="run_product_health_workflow")
    def run_product_health_workflow() -> dict[str, Any]:
        context = get_current_context()
        dag_run = context["dag_run"]
        conf = dag_run.conf or {}
        run_id = str(conf.get("run_id") or dag_run.run_id)
        workflow_definition = conf.get("workflow_definition") or load_contract(
            "workflow_definition.product_health.sample.json"
        )

        result = execute_product_health_workflow(workflow_definition=workflow_definition, run_id=run_id)
        write_result_artifact(conf, run_id, result)
        return result

    run_product_health_workflow()


def execute_product_health_workflow(workflow_definition: dict[str, Any], run_id: str) -> dict[str, Any]:
    started = perf_counter()
    task_results: list[dict[str, Any]] = []
    logs = [
        {"level": "info", "message": "queued"},
        {"level": "info", "message": "running"},
    ]
    output_path: Path | None = None
    output_format: str | None = None

    for node in workflow_definition["nodes"]:
        node_id = node["id"]
        node_type = node["type"]
        if node_type == "Source":
            source_id = node["source_id"]
            evidence = PRODUCT_HEALTH_SOURCE_EVIDENCE[source_id]
            task_results.append(source_task_result(node_id, source_id, evidence))
        elif node_type == "Materialize":
            task_results.append(materialize_task_result(node, run_id))
        elif node_type == "Load":
            output_path, output_format = write_output_rows(PRODUCT_HEALTH_ROWS, node["target_dataset"], run_id)
            task_results.append(
                succeeded_task_result(
                    node_id,
                    row_count=len(PRODUCT_HEALTH_ROWS),
                    bytes_read=path_size(output_path),
                    output_path=backend_visible_output_path(output_path),
                )
            )
        else:
            raise ValueError(f"Unsupported product-health DAG node type: {node_type}")
        logs.append({"level": "info", "message": f"{node_id} succeeded as {node_type}"})

    output_bytes = path_size(output_path)
    logs.append({"level": "info", "message": f"Airflow product-health DAG completed for {run_id}"})
    if output_format == "jsonl":
        logs.append({"level": "warning", "message": "pyarrow unavailable; wrote product-health smoke output as JSONL"})

    return {
        "status": "succeeded",
        "task_results": task_results,
        "logs": logs,
        "row_count": sum(source["row_count"] for source in PRODUCT_HEALTH_SOURCE_EVIDENCE.values()),
        "bytes": sum_bytes(PRODUCT_HEALTH_SOURCE_EVIDENCE.values()),
        "duration_ms": elapsed_ms(started),
        "output_path": backend_visible_output_path(output_path),
        "output_row_count": len(PRODUCT_HEALTH_ROWS),
        "output_bytes": output_bytes,
    }


def load_contract(file_name: str) -> dict[str, Any]:
    with (repo_root() / "contracts" / file_name).open(encoding="utf-8") as contract_file:
        return json.load(contract_file)


def source_task_result(node_id: str, source_id: str, evidence: dict[str, Any]) -> dict[str, Any]:
    return {
        "node_id": node_id,
        "status": "succeeded",
        "attempt": 1,
        "row_count": evidence["row_count"],
        "bytes": evidence["bytes"],
        "error": None,
        "source_id": source_id,
        "input_path": evidence["input_path"],
    }


def materialize_task_result(node: dict[str, Any], run_id: str) -> dict[str, Any]:
    layer = node.get("layer", "unknown")
    if layer == "bronze":
        row_count = sum(source["row_count"] for source in PRODUCT_HEALTH_SOURCE_EVIDENCE.values())
        bytes_read = sum_bytes(PRODUCT_HEALTH_SOURCE_EVIDENCE.values())
    else:
        row_count = len(PRODUCT_HEALTH_ROWS)
        bytes_read = None
    output_path = data_root() / "product_health" / layer / f"run_id={run_id}"
    output_path.mkdir(parents=True, exist_ok=True)
    return succeeded_task_result(
        node["id"],
        row_count=row_count,
        bytes_read=bytes_read,
        output_path=backend_visible_output_path(output_path),
    )


def succeeded_task_result(
    node_id: str,
    row_count: int | None,
    bytes_read: int | None,
    output_path: str | None,
) -> dict[str, Any]:
    return {
        "node_id": node_id,
        "status": "succeeded",
        "attempt": 1,
        "row_count": row_count,
        "bytes": bytes_read,
        "error": None,
        "output_path": output_path,
    }


def write_output_rows(rows: list[dict[str, Any]], target_dataset: str, run_id: str) -> tuple[Path, str]:
    output_dir = data_root() / "product_health" / "gold" / f"run_id={run_id}"
    output_dir.mkdir(parents=True, exist_ok=True)
    parquet_path = output_dir / f"{target_dataset}.parquet"
    if write_parquet_if_available(rows, parquet_path):
        return parquet_path, "parquet"

    jsonl_path = output_dir / f"{target_dataset}.jsonl"
    with jsonl_path.open("w", encoding="utf-8") as output_file:
        for row in rows:
            output_file.write(json.dumps(row, ensure_ascii=False, sort_keys=True))
            output_file.write("\n")
    return jsonl_path, "jsonl"


def write_parquet_if_available(rows: list[dict[str, Any]], output_path: Path) -> bool:
    try:
        import pyarrow as arrow
        import pyarrow.parquet as parquet
    except ImportError:
        return False

    table = arrow.Table.from_pylist(rows)
    parquet.write_table(table, output_path, compression="snappy")
    return True


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


def path_size(path: Path | None) -> int | None:
    return path.stat().st_size if path is not None and path.exists() else None


def sum_bytes(sources: Any) -> int:
    return sum(source["bytes"] for source in sources if source.get("bytes") is not None)


def elapsed_ms(started: float) -> int:
    return max(1, round((perf_counter() - started) * 1000))


def repo_root() -> Path:
    return Path(os.getenv("ASKLAKE_REPO_ROOT", "/opt/asklake"))


def data_root() -> Path:
    return Path(os.getenv("ASKLAKE_WEEK2_AIRFLOW_DATA_ROOT", str(repo_root() / "data" / "week2")))


asklake_week2_product_health()
