#!/usr/bin/env python3
"""Product Health 대표 경로의 여러 raw input을 M2 runner로 pass-through 실행한다."""

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

from app.domain.runtime_config import RuntimeConfig  # noqa: E402
from app.services.week2_spark_runner import Week2SparkRunner  # noqa: E402


DEFAULT_SOURCE_PATHS = {
    "reviews_seed": Path("backend/samples/product_health_reviews_seed.jsonl"),
    "behavior_events_seed": Path("backend/samples/product_health_behavior_events_seed.jsonl"),
    "delivery_trips_seed": Path("backend/samples/product_health_delivery_trips_seed.jsonl"),
    "product_master_seed": Path("backend/samples/product_health_product_master_seed.jsonl"),
}


def run_smoke(args: argparse.Namespace) -> dict[str, Any]:
    """CLI option을 RuntimeConfig로 바꾸고 M2 multi-source smoke evidence를 만든다."""

    source_inputs = [
        {
            "source_id": source_id,
            "input_format": "jsonl",
            "input_path": str(resolve_repo_path(path)),
        }
        for source_id, path in source_paths_from_args(args).items()
    ]
    output_root = resolve_repo_path(args.output_root)
    runtime_config = RuntimeConfig(
        runner="spark_runner",
        output_format="parquet",
        output_root=str(output_root),
        source_inputs=source_inputs,
        options={
            "compression": args.compression,
            "output_file_name_template": "{source_id}.parquet",
        },
    )
    result = Week2SparkRunner().run(runtime_config, run_id=args.run_id)
    return {
        "status": result.status,
        "run_id": args.run_id,
        "pipeline_id": "pipeline_product_health_runtime_smoke",
        "purpose": "M2 runtime/storage/evidence smoke only; M3 owns Bronze/Silver/Gold semantics.",
        "input": {
            "logical_sources": [source["source_id"] for source in source_inputs],
            "input_total_bytes": result.bytes,
            "input_total_rows": result.row_count,
            "sources": source_evidence(result.task_results),
        },
        "output": {
            "format": "parquet",
            "path": result.output_path,
            "output_total_rows": result.output_row_count,
            "output_total_bytes": result.output_bytes,
        },
        "metrics": {
            "duration_ms": result.duration_ms,
            "runtime_mode": "local_pyarrow_pass_through",
        },
        "runner": {
            "name": "spark_runner",
            "implementation": "Week2SparkRunner",
            "boundary_note": "This smoke intentionally does not implement TransformSpec semantics.",
        },
        "task_results": result.task_results,
        "logs": result.logs,
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


def source_evidence(task_results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """read/write task 결과를 source별 evidence로 접어준다."""

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
    """Product Health runtime smoke CLI option을 정의한다."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reviews", type=Path, default=None)
    parser.add_argument("--behavior", type=Path, default=None)
    parser.add_argument("--delivery", type=Path, default=None)
    parser.add_argument("--products", type=Path, default=None)
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path("data/results/m2_product_health_runtime_smoke"),
    )
    parser.add_argument("--run-id", default="run_product_health_runtime_smoke_001")
    parser.add_argument("--compression", default="snappy")
    parser.add_argument("--summary-path", type=Path, default=None)
    return parser.parse_args()


def main() -> int:
    """CLI entry point: evidence를 출력하고 실패하면 non-zero로 종료한다."""

    args = parse_args()
    evidence = run_smoke(args)
    if args.summary_path is not None:
        write_summary(args.summary_path, evidence)
    print(json.dumps(evidence, ensure_ascii=False, indent=2))
    return 0 if evidence.get("status") == "succeeded" else 1


if __name__ == "__main__":
    raise SystemExit(main())
