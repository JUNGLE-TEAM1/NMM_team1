#!/usr/bin/env python3
"""작은 Product Health 샘플로 M2 L6 실행과 SQL 검산 증거를 만든다."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.adapters.duckdb_sql_engine import DuckDBSqlEngine  # noqa: E402
from app.domain.ai_query import SqlEngineContext  # noqa: E402
from app.domain.runtime_config import RuntimeConfig  # noqa: E402
from app.services.week2_spark_runner import Week2SparkRunner  # noqa: E402


DEFAULT_SOURCE_PATHS = {
    "reviews_seed": Path("backend/samples/product_health_reviews_seed.jsonl"),
    "behavior_events_seed": Path("backend/samples/product_health_behavior_events_seed.jsonl"),
    "delivery_trips_seed": Path("backend/samples/product_health_delivery_trips_seed.jsonl"),
    "product_master_seed": Path("backend/samples/product_health_product_master_seed.jsonl"),
}
DEFAULT_SPEC_PATH = Path("backend/samples/product_health_l6_gold_generation_spec.json")


def run_evidence(args: argparse.Namespace) -> dict[str, Any]:
    """source pass-through와 L6 Gold preview를 실행하고 SQL 검산 결과를 합친다."""

    source_result = run_source_evidence(args)
    gold_result = run_l6_gold_preview(args)
    sql_check = run_sql_check(gold_result.output_path)
    status = "succeeded" if source_result.status == "succeeded" and gold_result.status == "succeeded" and sql_check["status"] == "succeeded" else "failed"

    return {
        "status": status,
        "run_id": args.run_id,
        "pipeline_id": "pipeline_product_health_e2e",
        "dataset_id": "dataset_product_health_gold",
        "table_name": "gold_product_health",
        "purpose": "M2 small Product Health L6 execution evidence; final Product Health semantics remain M3-owned.",
        "inputs": {
            "logical_sources": list(source_paths_from_args(args).keys()),
            "input_total_rows": source_result.row_count,
            "input_total_bytes": source_result.bytes,
            "source_tasks": source_task_evidence(source_result.task_results),
        },
        "l6_preview": {
            "transform_spec_path": str(resolve_repo_path(args.transform_spec_path)),
            "status": gold_result.status,
            "row_count": gold_result.row_count,
            "bytes": gold_result.bytes,
            "duration_ms": gold_result.duration_ms,
            "output_path": gold_result.output_path,
            "output_row_count": gold_result.output_row_count,
            "output_bytes": gold_result.output_bytes,
            "task_results": gold_result.task_results,
        },
        "sql_check": sql_check,
        "coverage": {
            "completed": [
                "Product Health source별 local_file read/write evidence",
                "M3 L6 preview-only aggregate spec execution",
                "gold_product_health Parquet output creation",
                "DuckDB SQL read smoke",
            ],
            "deferred": [
                "M3-owned negative_review_rate/conversion_rate/late_delivery_rate/risk_score final semantics",
                "5GB Product Health input evidence",
                "Docker Spark cluster execution",
                "Airflow DAG-internal SparkRunner invocation",
            ],
        },
    }


def run_source_evidence(args: argparse.Namespace):
    """원천 4종을 source별 Parquet로 써서 입력 증거를 남긴다."""

    source_inputs = [
        {
            "source_id": source_id,
            "source_type": "local_file",
            "format": "jsonl",
            "path": str(resolve_repo_path(path)),
        }
        for source_id, path in source_paths_from_args(args).items()
    ]
    runtime_config = RuntimeConfig(
        runner="spark_runner",
        output_format="parquet",
        output_root=str(resolve_repo_path(args.output_root)),
        source_inputs=source_inputs,
        options={"output_file_name_template": "{source_id}.parquet"},
    )
    return Week2SparkRunner().run(runtime_config, run_id=args.run_id)


def run_l6_gold_preview(args: argparse.Namespace):
    """reviews fact input에 L6 Gold preview spec을 적용한다."""

    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path=str(resolve_repo_path(args.reviews)),
        output_format="parquet",
        output_root=str(resolve_repo_path(args.output_root)),
        transform_spec_path=str(resolve_repo_path(args.transform_spec_path)),
        options={"output_file_name": "gold_product_health.parquet"},
    )
    return Week2SparkRunner().run(runtime_config, run_id=args.run_id)


def run_sql_check(output_path: str | None) -> dict[str, Any]:
    """Gold preview Parquet을 SQL 엔진이 읽을 수 있는지 확인한다."""

    if output_path is None:
        return {"status": "failed", "reason": "missing output_path"}

    engine = DuckDBSqlEngine()
    context = SqlEngineContext(
        table_name="gold_product_health",
        allowed_columns=["product_id", "review_count", "average_rating"],
        local_fallback_path=output_path,
        column_types={
            "product_id": "string",
            "review_count": "integer",
            "average_rating": "number",
        },
    )
    sql = "SELECT product_id, review_count, average_rating FROM gold_product_health LIMIT 100"
    validation = engine.validate(sql, context)
    result = engine.execute(sql, context)
    return {
        "status": validation.status,
        "engine": result.engine,
        "sql": result.sql,
        "row_count": result.row_count,
        "rows": result.rows,
        "duration_ms": result.duration_ms,
        "guardrail": validation.guardrail.model_dump(),
    }


def source_paths_from_args(args: argparse.Namespace) -> dict[str, Path]:
    """기본 sample path를 CLI override와 합친다."""

    paths = dict(DEFAULT_SOURCE_PATHS)
    if args.reviews is not None:
        paths["reviews_seed"] = args.reviews
    if args.behavior is not None:
        paths["behavior_events_seed"] = args.behavior
    if args.delivery is not None:
        paths["delivery_trips_seed"] = args.delivery
    if args.products is not None:
        paths["product_master_seed"] = args.products
    return paths


def source_task_evidence(task_results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """runner task 결과를 source별 읽기/쓰기 증거로 접어준다."""

    sources: dict[str, dict[str, Any]] = {}
    for task in task_results:
        source_id = task.get("source_id")
        if not source_id:
            continue
        evidence = sources.setdefault(source_id, {"source_id": source_id})
        if task["node_id"].startswith("spark_read:"):
            evidence["input_path"] = task.get("input_path")
            evidence["input_format"] = task.get("input_format")
            evidence["row_count"] = task.get("row_count")
            evidence["input_bytes"] = task.get("bytes")
        elif task["node_id"].startswith("spark_write:"):
            evidence["output_path"] = task.get("output_path")
            evidence["output_bytes"] = task.get("bytes")
    return list(sources.values())


def resolve_repo_path(path: Path) -> Path:
    """상대 경로를 repository root 기준 절대 경로로 바꾼다."""

    return path if path.is_absolute() else REPO_ROOT / path


def write_summary(path: Path, evidence: dict[str, Any]) -> None:
    """실행 evidence JSON을 파일로 저장한다."""

    summary_path = resolve_repo_path(path)
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    """Product Health L6 evidence CLI option을 정의한다."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reviews", type=Path, default=DEFAULT_SOURCE_PATHS["reviews_seed"])
    parser.add_argument("--behavior", type=Path, default=DEFAULT_SOURCE_PATHS["behavior_events_seed"])
    parser.add_argument("--delivery", type=Path, default=DEFAULT_SOURCE_PATHS["delivery_trips_seed"])
    parser.add_argument("--products", type=Path, default=DEFAULT_SOURCE_PATHS["product_master_seed"])
    parser.add_argument("--transform-spec-path", type=Path, default=DEFAULT_SPEC_PATH)
    parser.add_argument("--output-root", type=Path, default=Path("data/results/m2_product_health_l6_evidence"))
    parser.add_argument("--run-id", default="run_product_health_l6_evidence_001")
    parser.add_argument(
        "--summary-path",
        type=Path,
        default=Path("data/results/m2_product_health_l6_evidence/summary.json"),
    )
    return parser.parse_args()


def main() -> int:
    """CLI entry point: evidence를 출력하고 실패하면 non-zero로 종료한다."""

    args = parse_args()
    evidence = run_evidence(args)
    write_summary(args.summary_path, evidence)
    print(json.dumps(evidence, ensure_ascii=False, indent=2))
    return 0 if evidence.get("status") == "succeeded" else 1


if __name__ == "__main__":
    raise SystemExit(main())
