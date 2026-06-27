#!/usr/bin/env python3
import argparse
import json
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path: sys.path.insert(0, str(BACKEND_ROOT))

from app.services.week2_taxi_batch_runner import (  # noqa: E402
    GOLD_DATASET_ID,
    GOLD_TABLE_NAME,
    TaxiBatchConfig,
    Week2TaxiBatchRunner,
)


def run_evidence(
    input_path: Path,
    output_root: Path,
    run_id: str,
    profile: str,
    fixed_date: str | None,
    demo_limit: int,
    compression: str,
) -> dict:
    fixed_date = fixed_date if profile == "fixed" else None
    result = Week2TaxiBatchRunner().run(
        TaxiBatchConfig(
            input_path=str(resolve_repo_path(input_path)),
            output_root=str(resolve_repo_path(output_root)),
            run_id=run_id,
            profile=profile,
            fixed_date=fixed_date,
            demo_limit=demo_limit,
            compression=compression,
        )
    )
    evidence = {
        "status": result.status,
        "run_id": run_id,
        "pipeline_id": "pipeline_taxi_daily_metrics",
        "input": {
            "path": str(resolve_repo_path(input_path)),
            "format": "parquet",
            "profile": profile,
            "fixed_date": fixed_date,
            "row_count": result.row_count,
            "bytes": result.bytes,
        },
        "output": {
            "dataset_id": GOLD_DATASET_ID,
            "table_name": GOLD_TABLE_NAME,
            "format": "parquet",
            "path": result.output_path,
            "row_count": result.output_row_count,
            "bytes": result.output_bytes,
        },
        "metrics": {"duration_ms": result.duration_ms},
        "runner": {
            "name": "taxi_local_batch_runner",
            "implementation": "Week2TaxiBatchRunner",
            "runtime_note": "local pyarrow batch evidence; PySpark and S3-compatible writes are later phases.",
        },
        "task_results": result.task_results,
        "logs": result.logs,
    }
    if result.status != "succeeded":
        evidence["error"] = result.task_results[0].get("error") if result.task_results else "unknown error"
    return evidence


def resolve_repo_path(path: Path) -> Path:
    return path if path.is_absolute() else REPO_ROOT / path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run M2 Taxi local batch evidence.")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path(os.environ.get("ASKLAKE_TAXI_PARQUET", "data/raw/taxi/yellow_tripdata_2024-01.parquet")),
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path(os.environ.get("ASKLAKE_M2_OUTPUT_ROOT", "data/results/m2_taxi_local_batch_evidence")),
    )
    parser.add_argument("--run-id", default="run_taxi_local_batch_001")
    parser.add_argument("--profile", choices=["demo", "fixed", "local-full-month"], default="fixed")
    parser.add_argument("--fixed-date", default="2024-01-01")
    parser.add_argument("--demo-limit", type=int, default=10_000)
    parser.add_argument("--compression", default="snappy")
    parser.add_argument("--summary-path", type=Path, default=None)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    evidence = run_evidence(
        input_path=args.input,
        output_root=args.output_root,
        run_id=args.run_id,
        profile=args.profile,
        fixed_date=args.fixed_date,
        demo_limit=args.demo_limit,
        compression=args.compression,
    )
    if args.summary_path is not None:
        summary_path = resolve_repo_path(args.summary_path)
        summary_path.parent.mkdir(parents=True, exist_ok=True)
        summary_path.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(evidence, ensure_ascii=False, indent=2))
    return 0 if evidence.get("status") == "succeeded" else 1


if __name__ == "__main__":
    raise SystemExit(main())
