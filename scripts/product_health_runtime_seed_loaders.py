#!/usr/bin/env python3
"""Load Product Health synthetic source data into local runtime systems.

The loader keeps source ownership explicit:

- behavior_events -> Kafka topic
- product_catalog -> PostgreSQL table
- reviews / VOC -> MongoDB collection
- delivery_trip_logs -> MinIO/S3-compatible object prefix

It is designed for large local files, so CSV/JSONL paths stream records instead
of reading the whole dataset into memory. Secret values are taken from
environment variables or local runtime CLIs and are never written to evidence.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_EVIDENCE_ROOT = Path("data/results/product_health_runtime_seed_load")
UTC = timezone.utc


@dataclass(frozen=True)
class LoadTarget:
    role: str
    source_path: Path
    target_type: str
    target: str
    options: dict[str, Any]


def utc_now() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def resolve_path(path_value: str | Path) -> Path:
    path = Path(path_value).expanduser()
    return path if path.is_absolute() else REPO_ROOT / path


def display_path(path: Path) -> str:
    try:
        return str(path.relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def load_manifest(path: Path | None) -> list[LoadTarget]:
    payload = default_manifest() if path is None else json.loads(path.read_text(encoding="utf-8"))
    targets = payload["targets"] if isinstance(payload, dict) else payload
    return [
        LoadTarget(
            role=item["role"],
            source_path=resolve_path(item["source_path"]),
            target_type=item["target_type"],
            target=item["target"],
            options=dict(item.get("options", {})),
        )
        for item in targets
    ]


def default_manifest() -> dict[str, Any]:
    """Return the expected Product Health runtime seed mapping.

    Some raw paths are local/generated and may be absent in a fresh clone. Dry
    run evidence will report those as missing instead of pretending readiness.
    """

    return {
        "scenario_id": "product_health",
        "targets": [
            {
                "role": "behavior_events",
                "source_path": "data/local_sources/product_health/silver/silver_user_events.parquet",
                "target_type": "kafka",
                "target": "product-health.behavior-events",
                "options": {
                    "container": "kafka",
                    "broker": "localhost:9092",
                    "format": "parquet",
                    "batch_size": 1000,
                },
            },
            {
                "role": "product_catalog",
                "source_path": "data/local_sources/product_health/silver/silver_product_catalog.parquet",
                "target_type": "postgres",
                "target": "public.product_catalog",
                "options": {
                    "container": "product-health-postgres",
                    "database": "asklake",
                    "user": "asklake",
                    "format": "parquet",
                },
            },
            {
                "role": "reviews",
                "source_path": "data/local_sources/product_health/silver/silver_product_reviews.parquet",
                "target_type": "mongodb",
                "target": "asklake.product_reviews",
                "options": {
                    "container": "product-health-mongo",
                    "uri": "mongodb://localhost:27017",
                    "format": "parquet",
                },
            },
            {
                "role": "delivery_trip_logs",
                "source_path": "data/local_sources/product_health/silver/silver_delivery_trip_logs.parquet",
                "target_type": "minio",
                "target": "s3://asklake-demo/product_health/delivery_trip_logs/",
                "options": {
                    "endpoint_env": "ASKLAKE_DEMO_MINIO_ENDPOINT",
                    "access_key_env": "ASKLAKE_DEMO_MINIO_ACCESS_KEY",
                    "secret_key_env": "ASKLAKE_DEMO_MINIO_SECRET_KEY",
                    "region": "us-east-1",
                    "auto_create_bucket": True,
                },
            },
        ],
    }


def file_stats(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"exists": False, "bytes": 0, "row_count": None, "row_count_status": "missing"}
    if path.is_dir():
        files = [item for item in path.rglob("*") if item.is_file()]
        return {
            "exists": True,
            "bytes": sum(item.stat().st_size for item in files),
            "file_count": len(files),
            "row_count": None,
            "row_count_status": "directory_not_counted",
        }
    row_count = count_rows(path)
    return {
        "exists": True,
        "bytes": path.stat().st_size,
        "row_count": row_count,
        "row_count_status": "counted" if row_count is not None else "not_measured",
    }


def count_rows(path: Path) -> int | None:
    suffix = path.suffix.lower()
    if suffix == ".csv":
        with path.open("r", encoding="utf-8", errors="replace", newline="") as handle:
            return max(0, sum(1 for _ in handle) - 1)
    if suffix == ".jsonl":
        with path.open("r", encoding="utf-8", errors="replace") as handle:
            return sum(1 for line in handle if line.strip())
    return None


def run_command(command: list[str], stdin=None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        stdin=stdin,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )


def json_lines_from_csv(path: Path) -> Iterable[str]:
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            yield json.dumps(row, ensure_ascii=False, separators=(",", ":"))


def json_lines_from_jsonl(path: Path) -> Iterable[str]:
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            stripped = line.strip()
            if stripped:
                yield stripped


def json_lines_from_parquet(path: Path, batch_size: int = 10000) -> Iterable[str]:
    try:
        import pyarrow.parquet as pq
    except ImportError as exc:
        raise SystemExit("Parquet loading requires pyarrow.") from exc

    parquet_file = pq.ParquetFile(path)
    for batch in parquet_file.iter_batches(batch_size=batch_size):
        rows = batch.to_pylist()
        for row in rows:
            yield json.dumps(row, ensure_ascii=False, default=str, separators=(",", ":"))


def json_lines_from_path(path: Path, fmt: str) -> Iterable[str]:
    if fmt == "csv":
        return json_lines_from_csv(path)
    if fmt == "jsonl":
        return json_lines_from_jsonl(path)
    if fmt == "parquet":
        return json_lines_from_parquet(path)
    raise ValueError(f"Unsupported streaming input format: {fmt}")


def load_kafka(target: LoadTarget, dry_run: bool, limit: int | None) -> dict[str, Any]:
    options = target.options
    command = [
        "docker",
        "exec",
        "-i",
        options.get("container", "kafka"),
        "kafka-console-producer",
        "--bootstrap-server",
        options.get("broker", "localhost:9092"),
        "--topic",
        target.target,
    ]
    if dry_run:
        return loader_result(target, "dry_run", command=command, rows_loaded=0)

    fmt = options.get("format") or target.source_path.suffix.lower().lstrip(".")
    rows = json_lines_from_path(target.source_path, fmt)
    process = subprocess.Popen(
        command,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    sent = 0
    assert process.stdin is not None
    try:
        for row in rows:
            if limit is not None and sent >= limit:
                break
            process.stdin.write(row)
            process.stdin.write("\n")
            sent += 1
    finally:
        process.stdin.close()
    stdout = process.stdout.read() if process.stdout else ""
    stderr = process.stderr.read() if process.stderr else ""
    return_code = process.wait()
    return loader_result(
        target,
        "succeeded" if return_code == 0 else "failed",
        command=command,
        rows_loaded=sent,
        stdout=stdout,
        stderr=stderr,
        return_code=return_code,
    )


def postgres_table_parts(table: str) -> tuple[str, str]:
    if "." in table:
        schema, name = table.split(".", 1)
        return schema, name
    return "public", table


def quote_sql_identifier(value: str) -> str:
    return '"' + value.replace('"', '""') + '"'


def load_postgres(target: LoadTarget, dry_run: bool, limit: int | None) -> dict[str, Any]:
    options = target.options
    schema_name, table_name = postgres_table_parts(target.target)
    database = options.get("database", "asklake")
    user = options.get("user", "asklake")
    container = options.get("container", "product-health-postgres")
    fmt = options.get("format") or target.source_path.suffix.lower().lstrip(".")
    if fmt == "parquet":
        return load_postgres_parquet(target, dry_run, limit, container, user, database, schema_name, table_name)
    if fmt == "csv":
        sql = postgres_csv_sql(target.source_path, schema_name, table_name)
        input_stream = target.source_path.open("r", encoding="utf-8", errors="replace", newline="")
    else:
        sql = postgres_jsonl_sql(schema_name, table_name)
        input_stream = limited_lines(target.source_path, limit)
        limit = None
    command = ["docker", "exec", "-i", container, "psql", "-v", "ON_ERROR_STOP=1", "-U", user, "-d", database, "-c", sql]
    if dry_run:
        return loader_result(target, "dry_run", command=command, rows_loaded=0)
    with input_stream:
        result = run_command(command, stdin=input_stream)
    rows = count_rows(target.source_path) if limit is None else limit
    return loader_result(
        target,
        "succeeded" if result.returncode == 0 else "failed",
        command=command,
        rows_loaded=rows,
        stdout=result.stdout,
        stderr=result.stderr,
        return_code=result.returncode,
    )


def postgres_csv_sql(path: Path, schema_name: str, table_name: str) -> str:
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as handle:
        headers = next(csv.reader(handle))
    columns = [header.strip() or f"col_{index + 1}" for index, header in enumerate(headers)]
    quoted_schema = quote_sql_identifier(schema_name)
    quoted_table = quote_sql_identifier(table_name)
    column_defs = ", ".join(f"{quote_sql_identifier(column)} text" for column in columns)
    column_list = ", ".join(quote_sql_identifier(column) for column in columns)
    return (
        f"create schema if not exists {quoted_schema}; "
        f"drop table if exists {quoted_schema}.{quoted_table}; "
        f"create table {quoted_schema}.{quoted_table} ({column_defs}); "
        f"copy {quoted_schema}.{quoted_table} ({column_list}) from stdin with (format csv, header true);"
    )


def postgres_jsonl_sql(schema_name: str, table_name: str) -> str:
    quoted_schema = quote_sql_identifier(schema_name)
    quoted_table = quote_sql_identifier(table_name)
    return (
        f"create schema if not exists {quoted_schema}; "
        f"drop table if exists {quoted_schema}.{quoted_table}; "
        f"create table {quoted_schema}.{quoted_table} (payload jsonb); "
        f"copy {quoted_schema}.{quoted_table} (payload) from stdin;"
    )


def load_postgres_parquet(
    target: LoadTarget,
    dry_run: bool,
    limit: int | None,
    container: str,
    user: str,
    database: str,
    schema_name: str,
    table_name: str,
) -> dict[str, Any]:
    command = [
        "docker",
        "exec",
        "-i",
        container,
        "psql",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        user,
        "-d",
        database,
        "-c",
        "<create-table-and-copy-parquet-as-csv>",
    ]
    if dry_run:
        return loader_result(target, "dry_run", command=command, rows_loaded=0)

    try:
        import pyarrow.parquet as pq
    except ImportError as exc:
        raise SystemExit("PostgreSQL Parquet loading requires pyarrow.") from exc

    parquet_file = pq.ParquetFile(target.source_path)
    columns = parquet_file.schema_arrow.names
    quoted_schema = quote_sql_identifier(schema_name)
    quoted_table = quote_sql_identifier(table_name)
    column_defs = ", ".join(f"{quote_sql_identifier(column)} text" for column in columns)
    column_list = ", ".join(quote_sql_identifier(column) for column in columns)
    sql = (
        f"create schema if not exists {quoted_schema}; "
        f"drop table if exists {quoted_schema}.{quoted_table}; "
        f"create table {quoted_schema}.{quoted_table} ({column_defs}); "
        f"copy {quoted_schema}.{quoted_table} ({column_list}) from stdin with (format csv, header true);"
    )
    command[-1] = sql

    process = subprocess.Popen(
        command,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    assert process.stdin is not None
    writer = csv.DictWriter(process.stdin, fieldnames=columns)
    writer.writeheader()
    loaded = 0
    for batch in parquet_file.iter_batches(batch_size=10000):
        for row in batch.to_pylist():
            if limit is not None and loaded >= limit:
                break
            writer.writerow({column: "" if row.get(column) is None else row.get(column) for column in columns})
            loaded += 1
        if limit is not None and loaded >= limit:
            break
    process.stdin.close()
    stdout = process.stdout.read() if process.stdout else ""
    stderr = process.stderr.read() if process.stderr else ""
    return_code = process.wait()
    return loader_result(
        target,
        "succeeded" if return_code == 0 else "failed",
        command=command,
        rows_loaded=loaded,
        stdout=stdout,
        stderr=stderr,
        return_code=return_code,
    )


class limited_lines:
    def __init__(self, path: Path, limit: int | None):
        self.path = path
        self.limit = limit
        self.handle = None
        self.sent = 0

    def __enter__(self):
        self.handle = self.path.open("r", encoding="utf-8", errors="replace")
        return self

    def __exit__(self, *_):
        if self.handle:
            self.handle.close()

    def read(self, size: int = -1) -> str:
        if self.handle is None:
            return ""
        if self.limit is None:
            return self.handle.read(size)
        chunks = []
        while self.sent < self.limit:
            line = self.handle.readline()
            if not line:
                break
            if line.strip():
                self.sent += 1
            chunks.append(line)
            if size > 0 and sum(len(chunk) for chunk in chunks) >= size:
                break
        return "".join(chunks)


def load_mongodb(target: LoadTarget, dry_run: bool, limit: int | None) -> dict[str, Any]:
    database, collection = target.target.split(".", 1)
    options = target.options
    command = [
        "docker",
        "exec",
        "-i",
        options.get("container", "product-health-mongo"),
        "mongoimport",
        "--uri",
        options.get("uri", "mongodb://localhost:27017"),
        "--db",
        database,
        "--collection",
        collection,
        "--drop",
    ]
    fmt = options.get("format") or target.source_path.suffix.lower().lstrip(".")
    if fmt == "json_array":
        command.append("--jsonArray")
    if dry_run:
        return loader_result(target, "dry_run", command=command, rows_loaded=0)
    if fmt in {"csv", "jsonl", "parquet"}:
        process = subprocess.Popen(
            command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        assert process.stdin is not None
        loaded = 0
        for row in json_lines_from_path(target.source_path, fmt):
            if limit is not None and loaded >= limit:
                break
            process.stdin.write(row)
            process.stdin.write("\n")
            loaded += 1
        process.stdin.close()
        stdout = process.stdout.read() if process.stdout else ""
        stderr = process.stderr.read() if process.stderr else ""
        return_code = process.wait()
        return loader_result(
            target,
            "succeeded" if return_code == 0 else "failed",
            command=command,
            rows_loaded=loaded,
            stdout=stdout,
            stderr=stderr,
            return_code=return_code,
        )

    with target.source_path.open("r", encoding="utf-8", errors="replace") as handle:
        result = run_command(command, stdin=handle)
    return loader_result(
        target,
        "succeeded" if result.returncode == 0 else "failed",
        command=command,
        rows_loaded=count_rows(target.source_path) if limit is None else limit,
        stdout=result.stdout,
        stderr=result.stderr,
        return_code=result.returncode,
    )


def load_minio(target: LoadTarget, dry_run: bool, _limit: int | None) -> dict[str, Any]:
    """Upload one file to MinIO/S3-compatible storage with the existing adapter."""

    sys.path.insert(0, str(REPO_ROOT / "backend"))
    from app.domain.runtime_config import StorageConfig
    from app.services.week2_storage_adapter import Week2StorageAdapter

    bucket, prefix = parse_s3_target(target.target)
    options = target.options
    storage = StorageConfig(
        profile="minio",
        bucket=bucket,
        endpoint=os.environ.get(options.get("endpoint_env", "ASKLAKE_DEMO_MINIO_ENDPOINT")),
        region=options.get("region", "us-east-1"),
        prefix=prefix,
        local_fallback_root=str(target.source_path.parent),
        access_key_env=options.get("access_key_env", "ASKLAKE_DEMO_MINIO_ACCESS_KEY"),
        secret_key_env=options.get("secret_key_env", "ASKLAKE_DEMO_MINIO_SECRET_KEY"),
        auto_create_bucket=bool(options.get("auto_create_bucket", False)),
    )
    location = Week2StorageAdapter().build_location(
        storage,
        run_id=options.get("run_id", "seed_load"),
        file_name=target.source_path.name,
        local_root=target.source_path.parent,
    )
    object.__setattr__(location, "local_path", target.source_path)
    command = ["PUT", str(target.source_path), location.object_uri or target.target]
    if dry_run:
        return loader_result(target, "dry_run", command=command, rows_loaded=0, object_uri=location.object_uri)
    upload = Week2StorageAdapter().upload_file(storage, location)
    return loader_result(
        target,
        "succeeded",
        command=command,
        rows_loaded=None,
        object_uri=upload.object_uri,
        bytes_uploaded=upload.bytes,
        status_code=upload.status_code,
    )


def parse_s3_target(value: str) -> tuple[str, str]:
    if not value.startswith("s3://"):
        raise ValueError(f"MinIO target must be an s3:// URI: {value}")
    rest = value.removeprefix("s3://")
    bucket, _, prefix = rest.partition("/")
    return bucket, prefix if prefix.endswith("/") else f"{prefix}/"


def loader_result(target: LoadTarget, status: str, **extra: Any) -> dict[str, Any]:
    stats = file_stats(target.source_path)
    command = extra.pop("command", None)
    return {
        "role": target.role,
        "target_type": target.target_type,
        "target": target.target,
        "source_path": display_path(target.source_path),
        "status": status,
        "bytes": stats.get("bytes", 0),
        "source_row_count": stats.get("row_count"),
        "source_row_count_status": stats.get("row_count_status"),
        "command_preview": redact_command(command) if command else None,
        **extra,
    }


def redact_command(command: list[str]) -> list[str]:
    redacted = []
    for item in command:
        if "://" in item and "@" in item:
            redacted.append("<redacted-uri>")
        else:
            redacted.append(item)
    return redacted


def run_target(target: LoadTarget, dry_run: bool, limit: int | None) -> dict[str, Any]:
    stats = file_stats(target.source_path)
    if not stats["exists"]:
        return loader_result(target, "missing_source")
    if target.target_type == "kafka":
        return load_kafka(target, dry_run, limit)
    if target.target_type == "postgres":
        return load_postgres(target, dry_run, limit)
    if target.target_type == "mongodb":
        return load_mongodb(target, dry_run, limit)
    if target.target_type in {"minio", "s3"}:
        return load_minio(target, dry_run, limit)
    return loader_result(target, "unsupported_target")


def write_evidence(path: Path, summary: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, help="Optional JSON manifest. Defaults to Product Health mapping.")
    parser.add_argument("--evidence-root", type=Path, default=DEFAULT_EVIDENCE_ROOT)
    parser.add_argument("--only", action="append", help="Run only a role. Can be repeated.")
    parser.add_argument("--execute", action="store_true", help="Actually load data. Default is dry-run.")
    parser.add_argument("--limit", type=int, help="Limit rows/messages for smoke execution.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    targets = load_manifest(args.manifest)
    only = set(args.only or [])
    selected = [target for target in targets if not only or target.role in only]
    dry_run = not args.execute
    started_at = utc_now()
    results = [run_target(target, dry_run=dry_run, limit=args.limit) for target in selected]
    finished_at = utc_now()
    summary = {
        "contract": "ProductHealthRuntimeSeedLoadEvidence",
        "scenario_id": "product_health",
        "mode": "dry_run" if dry_run else "execute",
        "started_at": started_at,
        "finished_at": finished_at,
        "status": "succeeded" if all(item["status"] in {"dry_run", "succeeded"} for item in results) else "partial_or_failed",
        "targets": results,
        "secret_values_recorded": False,
    }
    evidence_path = resolve_path(args.evidence_root) / "summary.json"
    write_evidence(evidence_path, summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if summary["status"] == "succeeded" else 1


if __name__ == "__main__":
    raise SystemExit(main())
