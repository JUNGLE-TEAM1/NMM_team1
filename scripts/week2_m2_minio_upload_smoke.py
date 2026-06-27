#!/usr/bin/env python3
"""M2 SparkRunner output을 실제 MinIO endpoint에 업로드하는 수동 smoke CLI."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.domain.runtime_config import RuntimeConfig, StorageConfig
from app.services.week2_spark_runner import Week2SparkRunner
from app.services.week2_storage_adapter import Week2StorageAdapter


def main() -> int:
    """CLI 인자를 RuntimeConfig로 바꿔 SparkRunner와 MinIO upload smoke를 실행한다."""

    args = parse_args()
    endpoint = args.endpoint or os.environ.get("ASKLAKE_DEMO_MINIO_ENDPOINT")
    storage = StorageConfig(
        profile="minio",
        bucket=args.bucket,
        endpoint=endpoint,
        region=args.region,
        prefix=args.prefix,
        local_fallback_root=args.output_root,
        access_key_env=args.access_key_env,
        secret_key_env=args.secret_key_env,
        auto_create_bucket=args.auto_create_bucket,
    )
    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format=args.input_format,
        input_path=args.input,
        output_format="parquet",
        output_root=args.output_root,
        storage=storage,
        options={
            "compression": args.compression,
            "output_file_name": args.output_file_name,
            "upload_to_object_storage": True,
        },
    )

    result = Week2SparkRunner().run(runtime_config, run_id=args.run_id)
    location = Week2StorageAdapter().build_location(
        storage,
        run_id=args.run_id,
        file_name=args.output_file_name,
        local_root=args.output_root,
    )
    # summary에는 secret 값이나 signed header를 남기지 않는다.
    # 사람이 확인해야 하는 것은 local output, s3/object URI, row/byte metric, task 결과뿐이다.
    summary = {
        "status": result.status,
        "run_id": args.run_id,
        "input_path": args.input,
        "local_output_path": result.output_path,
        "s3_uri": location.uri,
        "object_uri": location.object_uri,
        "row_count": result.row_count,
        "bytes": result.bytes,
        "output_row_count": result.output_row_count,
        "output_bytes": result.output_bytes,
        "duration_ms": result.duration_ms,
        "task_results": result.task_results,
        "logs": result.logs,
    }
    write_summary(args.summary_path, summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if result.status == "succeeded" else 1


def parse_args() -> argparse.Namespace:
    """local MinIO smoke 재현에 필요한 CLI 옵션을 정의한다."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="backend/samples/amazon_reviews_demo.jsonl")
    parser.add_argument("--input-format", choices=["json", "jsonl", "parquet"], default="jsonl")
    parser.add_argument("--output-root", default="data/week2")
    parser.add_argument("--output-file-name", default="dataset_reviews_gold.parquet")
    parser.add_argument("--run-id", default="run_reviews_demo_minio_001")
    parser.add_argument("--bucket", default="asklake-demo")
    parser.add_argument("--prefix", default="reviews/gold/run_id=<run_id>/")
    parser.add_argument("--endpoint", default=None)
    parser.add_argument("--region", default="us-east-1")
    parser.add_argument("--access-key-env", default="ASKLAKE_DEMO_MINIO_ACCESS_KEY")
    parser.add_argument("--secret-key-env", default="ASKLAKE_DEMO_MINIO_SECRET_KEY")
    parser.add_argument("--auto-create-bucket", action="store_true")
    parser.add_argument("--compression", default="snappy")
    parser.add_argument(
        "--summary-path",
        default="data/results/m2_minio_upload_smoke/summary.json",
    )
    return parser.parse_args()


def write_summary(path_value: str, summary: dict[str, Any]) -> None:
    """smoke 결과 JSON을 data/results 아래에 저장한다."""

    path = REPO_ROOT / path_value if not Path(path_value).is_absolute() else Path(path_value)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit(main())
