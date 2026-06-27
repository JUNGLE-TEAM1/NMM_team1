#!/usr/bin/env python3
"""Generate Week 2 M1 delivery synthetic auxiliary seed from NYC Taxi parquet."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any, Iterable


REQUIRED_DELIVERY_FIELDS = [
    "delivery_id",
    "order_id",
    "product_id",
    "delivery_started_at",
    "delivered_at",
    "delivery_duration_minutes",
    "delivery_distance_km",
    "total_delivery_cost_amount",
    "currency",
    "late_delivery_flag",
    "late_threshold_minutes",
    "delivery_status",
    "source_dataset_id",
    "source_taxi_trip_id",
    "source_taxi_row_hash",
    "is_synthetic_source",
    "synthetic_generation_version",
    "synthetic_rule_id",
    "event_date",
]

SOURCE_DATASET_ID = "nyc_taxi"
SYNTHETIC_GENERATION_VERSION = "v1"
SYNTHETIC_RULE_ID = "taxi_to_delivery_seed_v1"
SOURCE_ROLE = "M5/M6 auxiliary synthetic dataset, not M3 main raw"


def stable_hash(parts: Iterable[Any]) -> str:
    normalized = ["" if value is None else str(value) for value in parts]
    return hashlib.sha256("|".join(normalized).encode("utf-8")).hexdigest()


def finite_float(value: Any, default: float = 0.0) -> float:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return default
    if not math.isfinite(numeric):
        return default
    return numeric


def coerce_datetime(value: Any) -> datetime | None:
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        parsed = value
    elif isinstance(value, date):
        parsed = datetime(value.year, value.month, value.day)
    else:
        try:
            parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except ValueError:
            return None

    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


def iso_z(value: datetime) -> str:
    return value.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def read_product_ids(path: Path, fallback_count: int) -> list[str]:
    ids: list[str] = []
    if path.exists():
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                row = json.loads(line)
                product_id = row.get("product_id")
                if product_id:
                    ids.append(str(product_id))
    if ids:
        return ids
    return [f"P{index:06d}" for index in range(1, fallback_count + 1)]


def taxi_row_to_delivery(
    row: dict[str, Any],
    source_index: int,
    product_id: str,
    late_threshold_minutes: int,
    source_start_at: datetime | None = None,
    source_end_at: datetime | None = None,
) -> dict[str, Any] | None:
    started_at = coerce_datetime(row.get("tpep_pickup_datetime"))
    delivered_at = coerce_datetime(row.get("tpep_dropoff_datetime"))
    if started_at is None or delivered_at is None or delivered_at <= started_at:
        return None
    if source_start_at is not None and started_at < source_start_at:
        return None
    if source_end_at is not None and started_at >= source_end_at:
        return None

    duration_minutes = int(round((delivered_at - started_at).total_seconds() / 60))
    if duration_minutes <= 0 or duration_minutes > 24 * 60:
        return None

    trip_distance_miles = finite_float(row.get("trip_distance"))
    total_amount = finite_float(row.get("total_amount"))
    distance_km = round(max(trip_distance_miles, 0.0) * 1.609344, 3)
    cost_amount = round(max(total_amount, 0.0), 2)
    source_taxi_trip_id = f"yellow_tripdata_2024-01:{source_index:08d}"
    row_hash = stable_hash(
        [
            row.get("tpep_pickup_datetime"),
            row.get("tpep_dropoff_datetime"),
            row.get("trip_distance"),
            row.get("total_amount"),
            row.get("PULocationID"),
            row.get("DOLocationID"),
        ]
    )

    delivery_number = source_index
    return {
        "delivery_id": f"D{delivery_number:08d}",
        "order_id": f"O{delivery_number:08d}",
        "product_id": product_id,
        "delivery_started_at": iso_z(started_at),
        "delivered_at": iso_z(delivered_at),
        "delivery_duration_minutes": duration_minutes,
        "delivery_distance_km": distance_km,
        "total_delivery_cost_amount": cost_amount,
        "currency": "USD",
        "late_delivery_flag": duration_minutes > late_threshold_minutes,
        "late_threshold_minutes": late_threshold_minutes,
        "delivery_status": "delivered",
        "source_dataset_id": SOURCE_DATASET_ID,
        "source_taxi_trip_id": source_taxi_trip_id,
        "source_taxi_row_hash": row_hash,
        "is_synthetic_source": True,
        "synthetic_generation_version": SYNTHETIC_GENERATION_VERSION,
        "synthetic_rule_id": SYNTHETIC_RULE_ID,
        "event_date": iso_z(started_at)[:10],
    }


def iter_taxi_rows(parquet_path: Path, limit: int) -> Iterable[dict[str, Any]]:
    try:
        import pandas as pd  # type: ignore
    except ModuleNotFoundError as exc:
        raise RuntimeError("pandas is required to read Taxi parquet input") from exc

    columns = [
        "tpep_pickup_datetime",
        "tpep_dropoff_datetime",
        "trip_distance",
        "total_amount",
        "PULocationID",
        "DOLocationID",
    ]
    try:
        frame = pd.read_parquet(parquet_path, columns=columns)
    except ImportError as exc:
        raise RuntimeError("A pandas parquet engine such as pyarrow or fastparquet is required") from exc

    for row in frame.head(limit).to_dict(orient="records"):
        yield row


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
            count += 1
    return count


def summarize_delivery(rows: list[dict[str, Any]]) -> dict[str, Any]:
    dates = [row["event_date"] for row in rows if row.get("event_date")]
    return {
        "row_count": len(rows),
        "required_fields": REQUIRED_DELIVERY_FIELDS,
        "required_fields_present": all(all(field in row for field in REQUIRED_DELIVERY_FIELDS) for row in rows),
        "is_synthetic_source_all_true": all(row.get("is_synthetic_source") is True for row in rows),
        "late_delivery_flag_boolean": all(isinstance(row.get("late_delivery_flag"), bool) for row in rows),
        "source_taxi_row_hash_present": all(bool(row.get("source_taxi_row_hash")) for row in rows),
        "min_event_date": min(dates) if dates else None,
        "max_event_date": max(dates) if dates else None,
    }


def write_parquet_copy(path: Path, rows: list[dict[str, Any]]) -> bool:
    try:
        import pandas as pd  # type: ignore
    except ModuleNotFoundError:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        pd.DataFrame(rows).to_parquet(path, index=False)
    except ImportError:
        return False
    return True


def update_manifest(path: Path, taxi_path: Path, output_path: Path, parquet_path: Path | None, row_count: int) -> dict[str, Any]:
    manifest = read_json(path)
    if not manifest:
        manifest = {
            "dataset_name": "week2_mvp_demo_raw",
            "connector_type": "json",
            "data_origin": "demo_synthetic_raw",
            "fixture_origin": "demo_synthetic_raw",
            "is_synthetic_source": True,
            "based_on": [],
            "source_files": {},
            "sample_size": {},
            "warning": "This is demo synthetic raw. It must not be presented as real production data.",
        }

    based_on = manifest.setdefault("based_on", [])
    if "nyc_taxi_2024_01_yellow_tripdata" not in based_on:
        based_on.append("nyc_taxi_2024_01_yellow_tripdata")
    source_files = manifest.setdefault("source_files", {})
    source_files["delivery_taxi_source"] = str(taxi_path)
    source_files["delivery_trips_seed"] = str(output_path)
    if parquet_path is not None:
        source_files["delivery_trips_seed_parquet"] = str(parquet_path)
    sample_size = manifest.setdefault("sample_size", {})
    sample_size["delivery_trips"] = row_count
    sample_size["taxi_rows"] = row_count
    manifest["connector_type"] = "json"
    manifest["delivery_seed_role"] = SOURCE_ROLE
    manifest["delivery_seed_logical_shape"] = "delivery_trips_seed_json"
    manifest["delivery_seed_source_profile"] = "synthetic_auxiliary_source"
    manifest["delivery_seed_caveat"] = "Taxi trips are transformed into synthetic delivery records for analysis support only."
    manifest["synthetic_generation_version"] = SYNTHETIC_GENERATION_VERSION
    manifest["synthetic_rule_id"] = SYNTHETIC_RULE_ID
    write_json(path, manifest)
    return manifest


def update_summary(path: Path, delivery_path: Path, parquet_path: Path | None, delivery_summary: dict[str, Any]) -> dict[str, Any]:
    summary = read_json(path)
    files = [entry for entry in summary.get("files", []) if entry.get("path") != str(delivery_path)]
    files.append(
        {
            "path": str(delivery_path),
            "format": "jsonl",
            "logical_shape": "delivery_trips_seed_json",
            "source_role": SOURCE_ROLE,
            **delivery_summary,
        }
    )
    if parquet_path is not None:
        files = [entry for entry in files if entry.get("path") != str(parquet_path)]
        files.append(
            {
                "path": str(parquet_path),
                "format": "parquet",
                "logical_shape": "delivery_trips_seed_json",
                "source_role": "Spark/M5/M6 convenience copy of delivery synthetic auxiliary seed",
                "row_count": delivery_summary["row_count"],
            }
        )
    summary["files"] = files
    summary["connector_type"] = "json"
    summary.setdefault("data_origin", "demo_synthetic_raw")
    summary.setdefault("synthetic_notice", "demo synthetic raw")
    limitations = summary.setdefault("known_limitations", [])
    caveat = "Delivery trips are synthetic auxiliary data derived from NYC Taxi trips, not real delivery source data."
    if caveat not in limitations:
        limitations.append(caveat)
    summary["delivery_seed_role"] = SOURCE_ROLE
    summary["delivery_seed_lineage"] = {
        "source_dataset_id": SOURCE_DATASET_ID,
        "synthetic_generation_version": SYNTHETIC_GENERATION_VERSION,
        "synthetic_rule_id": SYNTHETIC_RULE_ID,
    }
    write_json(path, summary)
    return summary


def generate(args: argparse.Namespace) -> dict[str, Any]:
    if not args.taxi_parquet.exists():
        raise FileNotFoundError(args.taxi_parquet)

    product_ids = read_product_ids(args.product_seed, args.fallback_product_count)
    source_start_at = coerce_datetime(args.source_start_at) if args.source_start_at else None
    source_end_at = coerce_datetime(args.source_end_at) if args.source_end_at else None
    rows: list[dict[str, Any]] = []
    for source_index, taxi_row in enumerate(iter_taxi_rows(args.taxi_parquet, args.limit * 3), start=1):
        product_id = product_ids[(source_index - 1) % len(product_ids)]
        delivery = taxi_row_to_delivery(
            taxi_row,
            source_index,
            product_id,
            args.late_threshold_minutes,
            source_start_at=source_start_at,
            source_end_at=source_end_at,
        )
        if delivery is None:
            continue
        rows.append(delivery)
        if len(rows) >= args.limit:
            break

    if not rows:
        raise ValueError("No valid Taxi rows were available for delivery seed generation")

    delivery_count = write_jsonl(args.output_jsonl, rows)
    parquet_written = write_parquet_copy(args.output_parquet, rows) if args.output_parquet else False
    parquet_path = args.output_parquet if parquet_written else None
    delivery_summary = summarize_delivery(rows)
    update_manifest(args.manifest, args.taxi_parquet, args.output_jsonl, parquet_path, delivery_count)
    summary = update_summary(args.summary, args.output_jsonl, parquet_path, delivery_summary)
    return summary


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--taxi-parquet", type=Path, default=Path("data/external/nyc-taxi/yellow_tripdata_2024-01.parquet"))
    parser.add_argument("--product-seed", type=Path, default=Path("data/week2/mvp_synthesis/raw_demo/product_master_seed.jsonl"))
    parser.add_argument("--output-jsonl", type=Path, default=Path("data/week2/mvp_synthesis/raw_demo/delivery_trips_seed.jsonl"))
    parser.add_argument("--output-parquet", type=Path, default=Path("data/week2/mvp_synthesis/raw_demo/delivery_trips_seed.parquet"))
    parser.add_argument("--manifest", type=Path, default=Path("data/week2/mvp_synthesis/metadata/source_manifest.json"))
    parser.add_argument("--summary", type=Path, default=Path("data/week2/mvp_synthesis/metadata/raw_demo_summary.json"))
    parser.add_argument("--limit", type=int, default=100_000)
    parser.add_argument("--fallback-product-count", type=int, default=10_000)
    parser.add_argument("--late-threshold-minutes", type=int, default=60)
    parser.add_argument("--source-start-at", default="2024-01-01T00:00:00Z")
    parser.add_argument("--source-end-at", default="2024-02-01T00:00:00Z")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    summary = generate(args)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
