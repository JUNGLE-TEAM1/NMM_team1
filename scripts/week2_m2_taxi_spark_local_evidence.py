#!/usr/bin/env python3
"""TLC Taxi Parquet을 PySpark local mode로 처리해 M2 scale evidence를 만든다."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.domain.runtime_config import StorageConfig  # noqa: E402
from app.services.week2_taxi_batch_runner import GOLD_DATASET_ID, GOLD_TABLE_NAME  # noqa: E402
from app.services.week2_taxi_spark_runner import TaxiSparkConfig, Week2TaxiSparkRunner  # noqa: E402
from app.services.week2_storage_adapter import Week2StorageAdapter  # noqa: E402


def run_evidence(args: argparse.Namespace) -> dict[str, Any]:
    """CLI 인자를 TaxiSparkConfig로 바꿔 실행하고 evidence JSON으로 감싼다."""

    input_path = resolve_repo_path(args.input)
    output_root = resolve_repo_path(args.output_root)
    storage = build_storage_config(args, output_root) if args.minio_upload else None
    result = Week2TaxiSparkRunner().run(
        TaxiSparkConfig(
            input_path=str(input_path),
            output_root=str(output_root),
            run_id=args.run_id,
            profile=args.profile,
            fixed_date=args.fixed_date if args.profile == "fixed" else None,
            demo_limit=args.demo_limit,
            compression=args.compression,
            master=args.master,
            app_name=args.app_name,
            driver_memory=args.driver_memory,
            parquet_vectorized_reader=not args.disable_vectorized_reader,
            storage=storage,
            upload_to_object_storage=args.minio_upload,
            direct_s3a_output_uri=args.direct_s3a_output_uri,
            s3a_endpoint=args.s3a_endpoint or args.endpoint or os.environ.get("ASKLAKE_DEMO_MINIO_ENDPOINT"),
            s3a_region=args.region,
            s3a_access_key_env=args.access_key_env,
            s3a_secret_key_env=args.secret_key_env,
            s3a_path_style_access=args.s3a_path_style_access,
            s3a_ssl_enabled=args.s3a_ssl_enabled,
        )
    )

    runner_name, runtime_note = runner_identity(args.master)
    evidence = {
        "status": result.status,
        "run_id": args.run_id,
        "pipeline_id": "pipeline_taxi_daily_metrics",
        "input": {
            "path": str(input_path),
            "format": "parquet",
            "profile": args.profile,
            "fixed_date": args.fixed_date if args.profile == "fixed" else None,
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
            "name": runner_name,
            "implementation": "Week2TaxiSparkRunner",
            "spark_master": args.master,
            "driver_memory": args.driver_memory,
            "parquet_vectorized_reader": not args.disable_vectorized_reader,
            "runtime_note": runtime_note,
        },
        "task_results": result.task_results,
        "logs": result.logs,
    }
    if args.direct_s3a_output_uri:
        evidence["output"]["write_mode"] = "spark_direct_s3a"
        evidence["output"]["s3a_uri"] = result.output_path
        evidence["output"]["endpoint_configured"] = bool(args.s3a_endpoint or args.endpoint or os.environ.get("ASKLAKE_DEMO_MINIO_ENDPOINT"))
    if storage is not None:
        location = Week2StorageAdapter().build_location(
            storage,
            run_id=args.run_id,
            file_name=f"{GOLD_TABLE_NAME}.parquet",
            local_root=str(output_root),
            default_prefix="taxi/gold/daily_metrics/run_id=<run_id>/",
        )
        evidence["output"]["storage_profile"] = storage.profile
        evidence["output"]["bucket"] = storage.bucket
        evidence["output"]["prefix"] = location.prefix
        evidence["output"]["s3_uri"] = location.uri
        evidence["output"]["object_uri"] = location.object_uri
        evidence["output"]["endpoint_configured"] = storage.endpoint is not None
    if result.status != "succeeded":
        evidence["error"] = result.task_results[0].get("error") if result.task_results else "unknown error"
    return evidence


def runner_identity(master: str) -> tuple[str, str]:
    """Spark master 값으로 local 실행과 Docker cluster 실행 evidence를 구분한다."""

    if master.startswith("local"):
        return (
            "taxi_spark_local_runner",
            "PySpark local mode evidence; Docker Spark cluster evidence is recorded by spark:// master runs.",
        )
    return (
        "taxi_spark_docker_cluster_runner",
        "Docker Spark cluster evidence using a Spark standalone master and worker containers.",
    )


def build_storage_config(args: argparse.Namespace, output_root: Path) -> StorageConfig:
    """MinIO/S3-compatible upload smoke용 storage 설정을 만든다."""

    return StorageConfig(
        profile="minio",
        bucket=args.bucket,
        endpoint=args.endpoint or os.environ.get("ASKLAKE_DEMO_MINIO_ENDPOINT"),
        region=args.region,
        prefix=args.prefix,
        local_fallback_root=str(output_root),
        access_key_env=args.access_key_env,
        secret_key_env=args.secret_key_env,
        auto_create_bucket=args.auto_create_bucket,
    )


def resolve_repo_path(path: Path) -> Path:
    """상대 경로를 repository root 기준 절대 경로로 바꾼다."""

    return path if path.is_absolute() else REPO_ROOT / path


def write_summary(path: Path, evidence: dict[str, Any]) -> None:
    """실행 evidence JSON을 파일로 저장한다."""

    summary_path = resolve_repo_path(path)
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    """터미널에서 받을 Taxi Spark local evidence option을 정의한다."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=Path(os.environ.get("ASKLAKE_TAXI_PARQUET", "data/raw/taxi/yellow_tripdata_2024-01.parquet")),
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path(os.environ.get("ASKLAKE_M2_OUTPUT_ROOT", "data/results/m2_taxi_spark_local_evidence")),
    )
    parser.add_argument("--run-id", default="run_taxi_spark_local_demo_001")
    parser.add_argument("--profile", choices=["demo", "fixed", "local-full-month"], default="demo")
    parser.add_argument("--fixed-date", default="2024-01-01")
    parser.add_argument("--demo-limit", type=int, default=10_000)
    parser.add_argument("--compression", default="snappy")
    parser.add_argument("--master", default="local[1]")
    parser.add_argument("--app-name", default="asklake-m2-taxi-spark-local")
    parser.add_argument("--driver-memory", default=None)
    parser.add_argument("--disable-vectorized-reader", action="store_true")
    parser.add_argument("--summary-path", type=Path, default=None)
    parser.add_argument("--minio-upload", action="store_true")
    parser.add_argument("--bucket", default="asklake-demo")
    parser.add_argument("--prefix", default="taxi/gold/daily_metrics/run_id=<run_id>/")
    parser.add_argument("--endpoint", default=None)
    parser.add_argument("--region", default="us-east-1")
    parser.add_argument("--access-key-env", default="ASKLAKE_DEMO_MINIO_ACCESS_KEY")
    parser.add_argument("--secret-key-env", default="ASKLAKE_DEMO_MINIO_SECRET_KEY")
    parser.add_argument("--auto-create-bucket", action="store_true")
    parser.add_argument("--direct-s3a-output-uri", default=None)
    parser.add_argument("--s3a-endpoint", default=None)
    parser.add_argument("--s3a-path-style-access", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--s3a-ssl-enabled", action=argparse.BooleanOptionalAction, default=None)
    return parser.parse_args()


def main() -> int:
    """CLI entry point: Spark evidence를 실행하고 성공 여부를 exit code로 돌려준다."""

    args = parse_args()
    evidence = run_evidence(args)
    if args.summary_path is not None:
        write_summary(args.summary_path, evidence)
    print(json.dumps(evidence, ensure_ascii=False, indent=2))
    return 0 if evidence.get("status") == "succeeded" else 1


if __name__ == "__main__":
    raise SystemExit(main())
