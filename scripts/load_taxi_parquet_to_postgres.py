#!/usr/bin/env python3
"""Load local TLC Yellow Taxi Parquet files into a local PostgreSQL table."""

from __future__ import annotations

import argparse
import json
import os
import re
import tempfile
from pathlib import Path
from typing import Any

import pyarrow as pa
import pyarrow.csv as arrow_csv
import pyarrow.parquet as pq


TAXI_COLUMNS = [
    ("VendorID", "vendor_id", pa.int64(), "BIGINT"),
    ("tpep_pickup_datetime", "tpep_pickup_datetime", pa.timestamp("us"), "TIMESTAMP"),
    ("tpep_dropoff_datetime", "tpep_dropoff_datetime", pa.timestamp("us"), "TIMESTAMP"),
    ("passenger_count", "passenger_count", pa.float64(), "DOUBLE PRECISION"),
    ("trip_distance", "trip_distance", pa.float64(), "DOUBLE PRECISION"),
    ("RatecodeID", "ratecode_id", pa.float64(), "DOUBLE PRECISION"),
    ("store_and_fwd_flag", "store_and_fwd_flag", pa.string(), "TEXT"),
    ("PULocationID", "pu_location_id", pa.int64(), "BIGINT"),
    ("DOLocationID", "do_location_id", pa.int64(), "BIGINT"),
    ("payment_type", "payment_type", pa.int64(), "BIGINT"),
    ("fare_amount", "fare_amount", pa.float64(), "DOUBLE PRECISION"),
    ("extra", "extra", pa.float64(), "DOUBLE PRECISION"),
    ("mta_tax", "mta_tax", pa.float64(), "DOUBLE PRECISION"),
    ("tip_amount", "tip_amount", pa.float64(), "DOUBLE PRECISION"),
    ("tolls_amount", "tolls_amount", pa.float64(), "DOUBLE PRECISION"),
    ("improvement_surcharge", "improvement_surcharge", pa.float64(), "DOUBLE PRECISION"),
    ("total_amount", "total_amount", pa.float64(), "DOUBLE PRECISION"),
    ("congestion_surcharge", "congestion_surcharge", pa.float64(), "DOUBLE PRECISION"),
    ("airport_fee", "airport_fee", pa.float64(), "DOUBLE PRECISION"),
]

AIRPORT_FEE_CANDIDATES = ("airport_fee", "Airport_fee")
IDENTIFIER_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


class TaxiLoadError(ValueError):
    pass


def main() -> int:
    args = parse_args()
    files = taxi_parquet_files(args.input, args.limit_files)
    summary = {
        "input": str(args.input),
        "files": len(files),
        "table": args.table,
        "dry_run": args.dry_run,
        "truncate": args.truncate,
        "dropped_columns": ["cbd_congestion_fee"],
        "column_names": [column[1] for column in TAXI_COLUMNS],
        "source_files": [str(path) for path in files],
        "row_count": parquet_row_count(files),
    }

    if args.dry_run:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 0

    try:
        import psycopg
    except ImportError as error:
        raise TaxiLoadError("psycopg is required for PostgreSQL load. Install backend requirements first.") from error

    password = os.environ.get(args.password_env)
    if not password:
        raise TaxiLoadError(f"Missing password env: {args.password_env}")

    schema_name, table_name = split_table_name(args.table)
    with psycopg.connect(
        host=args.host,
        port=args.port,
        dbname=args.database,
        user=args.username,
        password=password,
        connect_timeout=5,
    ) as connection:
        ensure_table(connection, schema_name, table_name)
        if args.truncate:
            truncate_table(connection, schema_name, table_name)
        loaded_rows = load_files(connection, schema_name, table_name, files)
        analyze_table(connection, schema_name, table_name)
        connection.commit()

    summary["loaded_rows"] = loaded_rows
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=55432)
    parser.add_argument("--database", default="taxi_postgre")
    parser.add_argument("--username", default="asklake")
    parser.add_argument("--password-env", default="ASKLAKE_TAXI_POSTGRES_PASSWORD")
    parser.add_argument("--table", default="public.yellow_taxi_trips")
    parser.add_argument("--limit-files", type=int, default=None)
    parser.add_argument("--truncate", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def taxi_parquet_files(path: Path, limit_files: int | None) -> list[Path]:
    if limit_files is not None and limit_files < 1:
        raise TaxiLoadError("--limit-files must be positive")
    if path.is_file():
        files = [path]
    elif path.is_dir():
        files = sorted(item for item in path.rglob("*.parquet") if item.is_file())
    else:
        raise TaxiLoadError(f"Input path not found: {path}")
    if not files:
        raise TaxiLoadError(f"No Parquet files found under: {path}")
    return files[:limit_files] if limit_files else files


def parquet_row_count(files: list[Path]) -> int:
    return sum(pq.ParquetFile(path).metadata.num_rows for path in files)


def split_table_name(value: str) -> tuple[str, str]:
    parts = value.split(".", maxsplit=1)
    if len(parts) != 2:
        raise TaxiLoadError("--table must be formatted as schema.table")
    schema_name, table_name = parts
    validate_identifier(schema_name)
    validate_identifier(table_name)
    return schema_name, table_name


def validate_identifier(value: str) -> None:
    if not IDENTIFIER_PATTERN.match(value):
        raise TaxiLoadError(f"Unsafe SQL identifier: {value}")


def quote_identifier(value: str) -> str:
    validate_identifier(value)
    return f'"{value}"'


def qualified_name(schema_name: str, table_name: str) -> str:
    return f"{quote_identifier(schema_name)}.{quote_identifier(table_name)}"


def ensure_table(connection: Any, schema_name: str, table_name: str) -> None:
    columns_sql = ",\n                    ".join(
        f"{quote_identifier(column_name)} {postgres_type}" for _, column_name, _, postgres_type in TAXI_COLUMNS
    )
    with connection.cursor() as cursor:
        cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {quote_identifier(schema_name)}")
        cursor.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {qualified_name(schema_name, table_name)} (
                    {columns_sql}
            )
            """
        )


def truncate_table(connection: Any, schema_name: str, table_name: str) -> None:
    with connection.cursor() as cursor:
        cursor.execute(f"TRUNCATE TABLE {qualified_name(schema_name, table_name)}")


def analyze_table(connection: Any, schema_name: str, table_name: str) -> None:
    with connection.cursor() as cursor:
        cursor.execute(f"ANALYZE {qualified_name(schema_name, table_name)}")


def load_files(connection: Any, schema_name: str, table_name: str, files: list[Path]) -> int:
    loaded_rows = 0
    for path in files:
        table = normalized_taxi_table(path)
        copy_table(connection, schema_name, table_name, table)
        loaded_rows += table.num_rows
    return loaded_rows


def normalized_taxi_table(path: Path) -> pa.Table:
    source_table = pq.read_table(path)
    source_names = set(source_table.column_names)
    arrays = []
    names = []
    for source_name, target_name, arrow_type, _ in TAXI_COLUMNS:
        candidate_name = select_source_column(source_name, source_names)
        if candidate_name is None:
            arrays.append(pa.nulls(source_table.num_rows, type=arrow_type))
        else:
            arrays.append(source_table[candidate_name].cast(arrow_type))
        names.append(target_name)
    return pa.table(arrays, names=names)


def select_source_column(source_name: str, source_names: set[str]) -> str | None:
    if source_name == "airport_fee":
        for candidate in AIRPORT_FEE_CANDIDATES:
            if candidate in source_names:
                return candidate
        return None
    return source_name if source_name in source_names else None


def copy_table(connection: Any, schema_name: str, table_name: str, table: pa.Table) -> None:
    with tempfile.NamedTemporaryFile(mode="w+b", suffix=".csv") as csv_file:
        arrow_csv.write_csv(
            table,
            csv_file,
            write_options=arrow_csv.WriteOptions(include_header=False, quoting_style="needed"),
        )
        csv_file.flush()
        csv_file.seek(0)
        column_names = ", ".join(quote_identifier(name) for name in table.column_names)
        sql = (
            f"COPY {qualified_name(schema_name, table_name)} ({column_names}) "
            "FROM STDIN WITH (FORMAT CSV, NULL '')"
        )
        with connection.cursor() as cursor:
            with cursor.copy(sql) as copy:
                while chunk := csv_file.read(1024 * 1024):
                    copy.write(chunk)


if __name__ == "__main__":
    raise SystemExit(main())
