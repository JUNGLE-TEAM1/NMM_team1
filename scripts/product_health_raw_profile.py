#!/usr/bin/env python3
"""Profile Product Health raw sources for PH-DATA-0."""

from __future__ import annotations

import csv
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import duckdb
import pandas as pd
import pyarrow.parquet as pq


ROOT = Path("data/local_sources/product_health")
RAW = ROOT / "raw"
EVIDENCE = ROOT / "evidence"
REPORT_PATH = EVIDENCE / "raw_profile_report.json"
SUMMARY_PATH = EVIDENCE / "raw_profile_summary.md"

SAMPLE_ROWS = 5000


def file_info(path: Path) -> dict[str, Any]:
    exists = path.exists()
    info: dict[str, Any] = {
        "path": str(path),
        "exists": exists,
        "is_symlink": path.is_symlink(),
    }
    if exists:
        stat = path.stat()
        info["bytes"] = stat.st_size
        if path.is_symlink():
            info["symlink_target"] = str(path.resolve())
    return info


def infer_scalar_type(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, int):
        return "int64"
    if isinstance(value, float):
        return "double"
    if isinstance(value, list):
        return "array"
    if isinstance(value, dict):
        return "object"
    return "string"


def infer_string_type(value: str) -> str:
    if value == "":
        return "string"
    lowered = value.lower()
    if lowered in {"true", "false"}:
        return "boolean"
    try:
        int(value)
        return "int64"
    except ValueError:
        pass
    try:
        float(value)
        return "double"
    except ValueError:
        pass
    try:
        datetime.fromisoformat(value.replace(" UTC", "+00:00"))
        return "timestamp"
    except ValueError:
        return "string"


def merge_type(current: str | None, new: str) -> str:
    if current is None or current == "null":
        return new
    if new == "null" or current == new:
        return current
    if {current, new} <= {"int64", "double"}:
        return "double"
    return "string"


def profile_csv(path: Path, category_fields: list[str]) -> dict[str, Any]:
    info = file_info(path)
    info["format"] = "csv"
    if not path.exists():
        return info

    types: dict[str, str] = {}
    nulls: Counter[str] = Counter()
    distincts: dict[str, Counter[str]] = {field: Counter() for field in category_fields}
    sample_rows: list[dict[str, str]] = []
    event_min: str | None = None
    event_max: str | None = None
    sampled = 0
    total_line_bytes = 0

    with path.open(newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        info["columns"] = reader.fieldnames or []
        for row in reader:
            sampled += 1
            if len(sample_rows) < 3:
                sample_rows.append(row)
            for key, value in row.items():
                if value == "":
                    nulls[key] += 1
                types[key] = merge_type(types.get(key), infer_string_type(value))
            for field in category_fields:
                value = row.get(field)
                if value:
                    distincts[field][value] += 1
            if row.get("event_time"):
                event_time = row["event_time"]
                event_min = event_time if event_min is None else min(event_min, event_time)
                event_max = event_time if event_max is None else max(event_max, event_time)
            total_line_bytes += sum(len(v or "") for v in row.values()) + max(len(row) - 1, 0)
            if sampled >= SAMPLE_ROWS:
                break

    avg_row_bytes = max(total_line_bytes / sampled, 1) if sampled else 1
    info.update(
        {
            "sampled_rows": sampled,
            "estimated_row_count": int(info["bytes"] / avg_row_bytes) if info.get("bytes") else None,
            "schema": [{"name": key, "inferred_type": types.get(key, "string")} for key in info["columns"]],
            "null_counts_sample": dict(nulls),
            "top_values": {field: counter.most_common(10) for field, counter in distincts.items()},
            "sample_date_range": {"event_time_min": event_min, "event_time_max": event_max},
            "sample_rows": sample_rows,
        }
    )
    return info


def profile_jsonl(path: Path, category_fields: list[str]) -> dict[str, Any]:
    info = file_info(path)
    info["format"] = "jsonl"
    if not path.exists():
        return info

    types: dict[str, str] = {}
    nulls: Counter[str] = Counter()
    distincts: dict[str, Counter[str]] = {field: Counter() for field in category_fields}
    sample_rows: list[dict[str, Any]] = []
    timestamp_min: int | float | None = None
    timestamp_max: int | float | None = None
    sampled = 0
    total_line_bytes = 0

    with path.open(encoding="utf-8") as jsonl_file:
        for line in jsonl_file:
            obj = json.loads(line)
            sampled += 1
            total_line_bytes += len(line)
            if len(sample_rows) < 3:
                sample_rows.append(obj)
            for key, value in obj.items():
                if value is None or value == "":
                    nulls[key] += 1
                types[key] = merge_type(types.get(key), infer_scalar_type(value))
            for field in category_fields:
                value = obj.get(field)
                if isinstance(value, list):
                    for item in value:
                        if isinstance(item, str):
                            distincts[field][item] += 1
                elif value:
                    distincts[field][str(value)] += 1
            timestamp = obj.get("timestamp")
            if isinstance(timestamp, (int, float)):
                timestamp_min = timestamp if timestamp_min is None else min(timestamp_min, timestamp)
                timestamp_max = timestamp if timestamp_max is None else max(timestamp_max, timestamp)
            if sampled >= SAMPLE_ROWS:
                break

    avg_line_bytes = max(total_line_bytes / sampled, 1) if sampled else 1
    columns = sorted(types)
    info.update(
        {
            "sampled_rows": sampled,
            "estimated_row_count": int(info["bytes"] / avg_line_bytes) if info.get("bytes") else None,
            "schema": [{"name": key, "inferred_type": types[key]} for key in columns],
            "null_counts_sample": dict(nulls),
            "top_values": {field: counter.most_common(10) for field, counter in distincts.items()},
            "sample_date_range": {"timestamp_min": timestamp_min, "timestamp_max": timestamp_max},
            "sample_rows": sample_rows,
        }
    )
    return info


def profile_json_array(path: Path, category_fields: list[str], load_full: bool = False) -> dict[str, Any]:
    info = file_info(path)
    info["format"] = "json"
    if not path.exists():
        return info

    if not load_full and path.stat().st_size > 100_000_000:
        info["profile_mode"] = "file_size_only_large_json"
        info["note"] = "Large JSON array is not fully loaded in PH-DATA-0; annotations-1k.json is used for schema/sample profiling."
        return info

    with path.open(encoding="utf-8") as json_file:
        data = json.load(json_file)
    rows = data if isinstance(data, list) else [data]
    sampled_rows = rows[:SAMPLE_ROWS]
    types: dict[str, str] = {}
    nulls: Counter[str] = Counter()
    distincts: dict[str, Counter[str]] = {field: Counter() for field in category_fields}

    for obj in sampled_rows:
        if not isinstance(obj, dict):
            continue
        for key, value in obj.items():
            if value is None or value == "":
                nulls[key] += 1
            types[key] = merge_type(types.get(key), infer_scalar_type(value))
        for field in category_fields:
            value = obj.get(field)
            if value:
                distincts[field][str(value)] += 1

    columns = sorted(types)
    info.update(
        {
            "profile_mode": "full_load" if load_full else "sample_file_load",
            "row_count": len(rows),
            "sampled_rows": len(sampled_rows),
            "schema": [{"name": key, "inferred_type": types[key]} for key in columns],
            "null_counts_sample": dict(nulls),
            "top_values": {field: counter.most_common(10) for field, counter in distincts.items()},
            "sample_rows": sampled_rows[:3],
        }
    )
    return info


def profile_xlsx(path: Path) -> dict[str, Any]:
    info = file_info(path)
    info["format"] = "xlsx"
    if not path.exists():
        return info

    frame = pd.read_excel(path, nrows=100)
    info.update(
        {
            "sampled_rows": len(frame),
            "columns": list(frame.columns),
            "schema": [{"name": name, "inferred_type": str(dtype)} for name, dtype in frame.dtypes.items()],
            "sample_rows": frame.head(3).fillna("").to_dict(orient="records"),
        }
    )
    return info


def profile_parquet_group(path: Path) -> dict[str, Any]:
    info = {
        "path": str(path),
        "exists": path.exists(),
        "is_symlink": path.is_symlink(),
        "format": "parquet_directory",
    }
    if path.exists() and path.is_symlink():
        info["symlink_target"] = str(path.resolve())
    files = sorted(path.glob("*.parquet")) if path.exists() else []
    total_bytes = sum(file.stat().st_size for file in files)
    total_rows = 0
    sample_file_profiles: list[dict[str, Any]] = []
    schema_names: list[str] = []
    schema_types: dict[str, str] = {}

    for file in files[:5]:
        parquet_file = pq.ParquetFile(file)
        metadata = parquet_file.metadata
        total_rows += metadata.num_rows
        if not schema_names:
            schema_names = parquet_file.schema_arrow.names
            schema_types = {field.name: str(field.type) for field in parquet_file.schema_arrow}
        sample_file_profiles.append(
            {
                "path": str(file),
                "bytes": file.stat().st_size,
                "row_count": metadata.num_rows,
            }
        )
    for file in files[5:]:
        total_rows += pq.ParquetFile(file).metadata.num_rows

    top_query: list[tuple[Any, ...]] = []
    date_range: dict[str, Any] = {}
    if files:
        con = duckdb.connect(database=":memory:")
        pattern = str(path / "*.parquet")
        try:
            min_started, max_started, row_count = con.execute(
                """
                select
                  min(tpep_pickup_datetime),
                  max(tpep_pickup_datetime),
                  count(*)
                from read_parquet(?)
                """,
                [pattern],
            ).fetchone()
            date_range = {
                "tpep_pickup_datetime_min": str(min_started),
                "tpep_pickup_datetime_max": str(max_started),
                "duckdb_row_count": row_count,
            }
            top_query = con.execute(
                """
                select PULocationID, count(*) as trips
                from read_parquet(?)
                group by 1
                order by trips desc
                limit 10
                """,
                [pattern],
            ).fetchall()
        except Exception as exc:  # pragma: no cover - evidence path
            date_range = {"error": str(exc)}

    info.update(
        {
            "file_count": len(files),
            "bytes": total_bytes,
            "row_count": total_rows,
            "schema": [{"name": name, "inferred_type": schema_types.get(name, "parquet")} for name in schema_names],
            "sample_files": sample_file_profiles,
            "date_range": date_range,
            "top_values": {"PULocationID": top_query},
        }
    )
    return info


def calibration_findings(profiles: dict[str, Any]) -> list[dict[str, str]]:
    findings: list[dict[str, str]] = []

    if profiles["taxi_2019_2025"].get("bytes", 0) + profiles["taxi_2026_partial"].get("bytes", 0) < 5_000_000_000:
        findings.append(
            {
                "severity": "medium",
                "area": "5GB evidence",
                "finding": "Taxi linked data is slightly below 5GB by decimal bytes, but the combined Product Health inputs exceed 5GB once Kaggle/Amazon/MEP are included.",
                "suggestion": "PH-DATA-3 should compute `input_total_bytes` across all selected Product Health sources, not Taxi alone.",
            }
        )

    kaggle_schema = {item["name"] for item in profiles["kaggle_oct"].get("schema", [])}
    if "category_code" in kaggle_schema:
        findings.append(
            {
                "severity": "low",
                "area": "category mapping",
                "finding": "Kaggle category is available as dotted `category_code`; some rows have blank category_code.",
                "suggestion": "Use `category_code` when present and fall back to `category_id` for category normalization.",
            }
        )

    amazon_review_schema = {item["name"] for item in profiles["amazon_reviews"].get("schema", [])}
    if "timestamp" in amazon_review_schema:
        findings.append(
            {
                "severity": "low",
                "area": "review timestamp",
                "finding": "Amazon review timestamp is present and inferred as numeric epoch-like value, not ISO timestamp.",
                "suggestion": "PH-DATA-1 should parse `timestamp` as epoch milliseconds if sample validation confirms the unit.",
            }
        )

    mep_full = profiles["mep_annotations_full"]
    if mep_full.get("profile_mode") == "file_size_only_large_json":
        findings.append(
            {
                "severity": "low",
                "area": "MEP full profile",
                "finding": "Full MEP annotations JSON is a 1.6GB array and was not fully loaded during PH-DATA-0.",
                "suggestion": "Use `annotations-1k.json` for smoke schema and load full `annotations.json` only in PH-DATA-1/3 if needed.",
            }
        )

    for profile_name in ("taxi_2019_2025", "taxi_2026_partial"):
        date_range = profiles[profile_name].get("date_range", {})
        min_date = str(date_range.get("tpep_pickup_datetime_min", ""))
        max_date = str(date_range.get("tpep_pickup_datetime_max", ""))
        if min_date.startswith("2001") or max_date.startswith("2098"):
            findings.append(
                {
                    "severity": "medium",
                    "area": "taxi date filter",
                    "finding": f"{profile_name} contains pickup datetime outliers: min={min_date}, max={max_date}.",
                    "suggestion": "PH-DATA-1 should filter Taxi records to the intended demo window before calculating delivery duration and late delivery rate.",
                }
            )

    findings.append(
        {
            "severity": "medium",
            "area": "path convention",
            "finding": "Local preparation root is `data/local_sources/product_health`, while M5 Product Health output convention may use `data/week2/product_health/gold/run_id=.../dataset_product_health_gold.parquet`.",
            "suggestion": "PH-DATA-1 can write local prep outputs under `data/local_sources`, then PH-DATA-4 should align M5 handoff path with the active Catalog convention.",
        }
    )
    return findings


def markdown_summary(report: dict[str, Any]) -> str:
    lines = [
        "# Product Health Raw Profile Summary",
        "",
        f"- generated_at: `{report['generated_at']}`",
        f"- root: `{ROOT}`",
        "",
        "## Source Summary",
        "",
        "| Source | Format | Files/Rows | Bytes | Key columns |",
        "| --- | --- | ---: | ---: | --- |",
    ]
    for name, profile in report["profiles"].items():
        schema = profile.get("schema", [])
        key_columns = ", ".join(item["name"] for item in schema[:8])
        rows = profile.get("row_count") or profile.get("estimated_row_count") or profile.get("sampled_rows") or profile.get("file_count") or "-"
        lines.append(
            f"| `{name}` | {profile.get('format', '-')} | {rows} | {profile.get('bytes', 0)} | {key_columns} |"
        )

    lines.extend(["", "## Source Details", ""])
    for name, profile in report["profiles"].items():
        lines.append(f"### `{name}`")
        lines.append("")
        schema = profile.get("schema", [])
        if schema:
            lines.append("- schema:")
            for item in schema[:12]:
                lines.append(f"  - `{item['name']}`: `{item.get('inferred_type', '-')}`")
        sample_range = profile.get("sample_date_range") or profile.get("date_range")
        if sample_range:
            lines.append(f"- date_range: `{sample_range}`")
        top_values = profile.get("top_values") or {}
        compact_top = {
            key: values[:5]
            for key, values in top_values.items()
            if values
        }
        if compact_top:
            lines.append(f"- top_values_sample: `{compact_top}`")
        sample_rows = profile.get("sample_rows") or []
        if sample_rows:
            lines.append("- sample_row:")
            lines.append(f"  - `{json.dumps(sample_rows[0], ensure_ascii=False, default=str)[:800]}`")
        note = profile.get("note")
        if note:
            lines.append(f"- note: {note}")
        lines.append("")

    lines.extend(["", "## Contract Calibration Findings", ""])
    for item in report["contract_calibration_findings"]:
        lines.append(f"- **{item['severity']} / {item['area']}**: {item['finding']} {item['suggestion']}")

    lines.extend(["", "## PH-DATA-1 Smoke Input Recommendation", ""])
    for item in report["smoke_input_recommendation"]:
        lines.append(f"- `{item['source']}`: `{item['path']}` - {item['reason']}")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    profiles = {
        "kaggle_oct": profile_csv(
            RAW / "kaggle_ecommerce_behavior/2019-Oct.csv",
            ["event_type", "category_code", "brand"],
        ),
        "kaggle_nov": profile_csv(
            RAW / "kaggle_ecommerce_behavior/2019-Nov.csv",
            ["event_type", "category_code", "brand"],
        ),
        "amazon_reviews": profile_jsonl(
            RAW / "amazon_reviews_2023/raw/review_categories/All_Beauty.jsonl",
            ["rating", "verified_purchase"],
        ),
        "amazon_metadata": profile_jsonl(
            RAW / "amazon_reviews_2023/raw/meta_categories/meta_All_Beauty.jsonl",
            ["main_category", "store"],
        ),
        "mep_annotations_1k": profile_json_array(
            RAW / "mep_3m/annotations-1k.json",
            ["class_name", "sub_class_name", "subsub_class_name"],
            load_full=True,
        ),
        "mep_annotations_full": profile_json_array(
            RAW / "mep_3m/annotations.json",
            ["class_name", "sub_class_name", "subsub_class_name"],
            load_full=False,
        ),
        "mep_dataset_info": profile_xlsx(RAW / "mep_3m/dataset_info.xlsx"),
        "taxi_2019_2025": profile_parquet_group(RAW / "taxi_existing/yellow_tripdata_2019_2025"),
        "taxi_2026_partial": profile_parquet_group(RAW / "taxi_existing/yellow_tripdata_2026_partial"),
    }
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "phase": "PH-DATA-0",
        "profiles": profiles,
        "contract_calibration_findings": calibration_findings(profiles),
        "smoke_input_recommendation": [
            {
                "source": "behavior",
                "path": "raw/kaggle_ecommerce_behavior/2019-Oct.csv",
                "reason": "CSV header matches contract; enough rows for 500k smoke.",
            },
            {
                "source": "review",
                "path": "raw/amazon_reviews_2023/raw/review_categories/All_Beauty.jsonl",
                "reason": "JSONL has rating/text/parent_asin/timestamp fields required for review silver.",
            },
            {
                "source": "review_metadata",
                "path": "raw/amazon_reviews_2023/raw/meta_categories/meta_All_Beauty.jsonl",
                "reason": "Metadata has title/categories/parent_asin fields for product enrichment.",
            },
            {
                "source": "product_catalog",
                "path": "raw/mep_3m/annotations-1k.json",
                "reason": "Small JSON sample has title/OCR/category/image path fields without loading 1.6GB full array.",
            },
            {
                "source": "delivery",
                "path": "raw/taxi_existing/yellow_tripdata_2019_2025/*.parquet",
                "reason": "Parquet files expose pickup/dropoff/distance/location/fare fields required for delivery silver.",
            },
        ],
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    SUMMARY_PATH.write_text(markdown_summary(report), encoding="utf-8")
    print(f"Wrote {REPORT_PATH}")
    print(f"Wrote {SUMMARY_PATH}")


if __name__ == "__main__":
    main()
