#!/usr/bin/env python3
"""Import Product Health handoff artifacts into the Week 2 catalog store.

The handoff package is a prepared demo artifact bundle, not the application
CatalogMetadata shape. This script preserves the handoff files under local
ignored data storage, converts the Gold parquet into the canonical
`product_health_gold_contract_v2` column set, then writes Week 2 run and catalog
metadata that M6 AI Query can read through DuckDB.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import pyarrow as pa
import pyarrow.parquet as pq


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.week2_catalog_store import Week2CatalogStore  # noqa: E402


DATASET_ID = "dataset_product_health_gold"
GOLD_TABLE_NAME = "gold_product_health"
PIPELINE_ID = "pipeline_product_health_e2e"
SCHEMA_VERSION = "schema_product_health_gold_v2"
CATALOG_VERSION = "catalog_product_health_gold_handoff_v1"
DEFAULT_RUN_ID = "run_product_health_5gb_001"

CANONICAL_FIELDS = [
    {"name": "product_id", "type": "string", "nullable": False},
    {"name": "synthetic_product_id", "type": "string", "nullable": True},
    {"name": "canonical_product_id", "type": "string", "nullable": True},
    {"name": "product_name", "type": "string", "nullable": True},
    {"name": "normalized_brand", "type": "string", "nullable": True},
    {"name": "unified_category", "type": "string", "nullable": True},
    {"name": "category_l1", "type": "string", "nullable": True},
    {"name": "ecommerce_product_id", "type": "string", "nullable": True},
    {"name": "amazon_parent_asin", "type": "string", "nullable": True},
    {"name": "match_confidence", "type": "number", "nullable": True},
    {"name": "match_method", "type": "string", "nullable": True},
    {"name": "review_count", "type": "integer", "nullable": False},
    {"name": "average_rating", "type": "number", "nullable": True},
    {"name": "negative_review_rate", "type": "number", "nullable": True},
    {"name": "view_count", "type": "integer", "nullable": False},
    {"name": "purchase_count", "type": "integer", "nullable": False},
    {"name": "conversion_rate", "type": "number", "nullable": True},
    {"name": "delivery_count", "type": "integer", "nullable": False},
    {"name": "late_delivery_rate", "type": "number", "nullable": True},
    {"name": "risk_score", "type": "number", "nullable": True},
]
CANONICAL_COLUMNS = [field["name"] for field in CANONICAL_FIELDS]
COUNT_COLUMNS = {"review_count", "view_count", "purchase_count", "delivery_count"}
NUMBER_COLUMNS = {
    "match_confidence",
    "average_rating",
    "negative_review_rate",
    "conversion_rate",
    "late_delivery_rate",
    "risk_score",
}
REQUIRED_HANDOFF_FILES = [
    "README.md",
    "catalog/dataset_product_health_gold.json",
    "catalog/product_health_source_handoff.json",
    "evidence/product_health_5gb_run_summary.json",
    "evidence/product_health_run_summary.json",
    "evidence/raw_profile_summary.md",
    "gold/gold_product_health.parquet",
    "silver/seed_product_mapping.parquet",
    "silver/silver_delivery_trip_logs.parquet",
    "silver/silver_product_catalog.parquet",
    "silver/silver_product_reviews.parquet",
    "silver/silver_user_events.parquet",
]


@dataclass(frozen=True)
class ImportConfig:
    handoff_root: Path
    output_root: Path
    archive_root: Path | None
    run_id: str | None = None
    evidence_profile: str = "5gb"


@dataclass(frozen=True)
class ImportResult:
    run_id: str
    catalog_path: Path
    run_path: Path
    canonical_gold_path: Path
    canonical_rows: int
    canonical_bytes: int
    processed_input_bytes: int | None
    archived_files: int

    def as_dict(self) -> dict[str, Any]:
        return {
            "run_id": self.run_id,
            "catalog_path": str(self.catalog_path),
            "run_path": str(self.run_path),
            "canonical_gold_path": str(self.canonical_gold_path),
            "canonical_rows": self.canonical_rows,
            "canonical_bytes": self.canonical_bytes,
            "processed_input_bytes": self.processed_input_bytes,
            "archived_files": self.archived_files,
        }


def import_handoff(config: ImportConfig) -> ImportResult:
    handoff_root = config.handoff_root.resolve()
    validate_handoff_root(handoff_root)

    archived_files = 0
    if config.archive_root is not None:
        archived_files = archive_handoff(handoff_root, resolve_repo_path(config.archive_root))

    run_summary = load_run_summary(handoff_root, config.evidence_profile)
    source_handoff = read_json(handoff_root / "catalog" / "product_health_source_handoff.json")
    run_id = config.run_id or str(run_summary.get("run_id") or DEFAULT_RUN_ID)
    output_root = resolve_repo_path(config.output_root)
    canonical_gold_path = output_root / "product_health" / "gold" / f"run_id={run_id}" / f"{GOLD_TABLE_NAME}.parquet"

    canonical_table = build_canonical_gold_table(
        gold_path=handoff_root / "gold" / "gold_product_health.parquet",
        mapping_path=handoff_root / "silver" / "seed_product_mapping.parquet",
    )
    validate_canonical_table(canonical_table)
    canonical_gold_path.parent.mkdir(parents=True, exist_ok=True)
    pq.write_table(canonical_table, canonical_gold_path, compression="snappy")

    processed_input_bytes = measured_processed_input_bytes(run_summary)
    catalog = build_catalog_metadata(
        canonical_gold_path=canonical_gold_path,
        row_count=canonical_table.num_rows,
        output_bytes=canonical_gold_path.stat().st_size,
        run_id=run_id,
        run_summary=run_summary,
        source_handoff=source_handoff,
        processed_input_bytes=processed_input_bytes,
    )
    run = build_run_metadata(
        canonical_gold_path=canonical_gold_path,
        row_count=canonical_table.num_rows,
        output_bytes=canonical_gold_path.stat().st_size,
        run_id=run_id,
        run_summary=run_summary,
        source_handoff=source_handoff,
        processed_input_bytes=processed_input_bytes,
    )

    catalog_store = Week2CatalogStore(output_root / "_metadata")
    catalog_store.save_catalog(catalog)
    catalog_store.save_run(run)
    return ImportResult(
        run_id=run_id,
        catalog_path=catalog_store.catalog_dir / f"{DATASET_ID}.json",
        run_path=catalog_store.runs_dir / f"{run_id}.json",
        canonical_gold_path=canonical_gold_path,
        canonical_rows=canonical_table.num_rows,
        canonical_bytes=canonical_gold_path.stat().st_size,
        processed_input_bytes=processed_input_bytes,
        archived_files=archived_files,
    )


def validate_handoff_root(handoff_root: Path) -> None:
    missing = [relative for relative in REQUIRED_HANDOFF_FILES if not (handoff_root / relative).exists()]
    if missing:
        raise FileNotFoundError(f"Product Health handoff is missing required files: {', '.join(missing)}")


def archive_handoff(handoff_root: Path, archive_root: Path) -> int:
    copied = 0
    for relative in REQUIRED_HANDOFF_FILES:
        source = handoff_root / relative
        target = archive_root / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        copied += 1
    return copied


def build_canonical_gold_table(gold_path: Path, mapping_path: Path) -> pa.Table:
    gold_rows = pq.read_table(gold_path).to_pylist()
    mapping_by_internal_id = {
        str(row["internal_product_id"]): row
        for row in pq.read_table(mapping_path).to_pylist()
        if row.get("internal_product_id")
    }
    canonical_rows = [
        canonical_gold_row(row, mapping_by_internal_id.get(str(row.get("internal_product_id"))))
        for row in gold_rows
    ]
    return pa.Table.from_pylist(canonical_rows, schema=canonical_schema())


def canonical_gold_row(row: dict[str, Any], mapping: dict[str, Any] | None) -> dict[str, Any]:
    mapping = mapping or {}
    internal_product_id = as_string(row.get("internal_product_id"))
    return {
        "product_id": internal_product_id,
        "synthetic_product_id": internal_product_id,
        "canonical_product_id": as_string(mapping.get("mep_product_id")) or internal_product_id,
        "product_name": as_string(row.get("product_title")),
        "normalized_brand": as_string(row.get("brand")),
        "unified_category": as_string(row.get("demo_category_label")) or as_string(row.get("category_l1")),
        "category_l1": as_string(row.get("category_l1")),
        "ecommerce_product_id": as_string(mapping.get("ecommerce_product_id")),
        "amazon_parent_asin": as_string(mapping.get("amazon_parent_asin")),
        "match_confidence": as_float(mapping.get("mapping_confidence")),
        "match_method": as_string(mapping.get("mapping_method") or row.get("mapping_method")),
        "review_count": as_int(row.get("review_count")),
        "average_rating": as_float(row.get("avg_rating")),
        "negative_review_rate": as_float(row.get("negative_review_rate")),
        "view_count": as_int(row.get("view_count")),
        "purchase_count": as_int(row.get("purchase_count")),
        "conversion_rate": as_float(row.get("conversion_rate")),
        "delivery_count": as_int(row.get("delivery_count")),
        "late_delivery_rate": as_float(row.get("late_delivery_rate")),
        "risk_score": as_float(row.get("risk_score")),
    }


def validate_canonical_table(table: pa.Table) -> None:
    columns = table.column_names
    if columns != CANONICAL_COLUMNS:
        raise ValueError(f"Canonical Gold columns do not match contract: {columns}")
    if table.num_rows < 1:
        raise ValueError("Canonical Gold output must contain at least one row.")

    rows = table.to_pylist()
    missing_product_ids = sum(1 for row in rows if not row.get("product_id"))
    if missing_product_ids:
        raise ValueError(f"Canonical Gold contains rows without product_id: {missing_product_ids}")

    invalid_risk_scores = [
        row.get("product_id")
        for row in rows
        if row.get("risk_score") is not None and not 0 <= float(row["risk_score"]) <= 100
    ]
    if invalid_risk_scores:
        raise ValueError(f"risk_score out of range for products: {invalid_risk_scores[:5]}")


def canonical_schema() -> pa.Schema:
    fields = []
    for field in CANONICAL_FIELDS:
        name = field["name"]
        if name in COUNT_COLUMNS:
            arrow_type = pa.int64()
        elif name in NUMBER_COLUMNS:
            arrow_type = pa.float64()
        else:
            arrow_type = pa.string()
        fields.append(pa.field(name, arrow_type, nullable=bool(field["nullable"])))
    return pa.schema(fields)


def build_catalog_metadata(
    canonical_gold_path: Path,
    row_count: int,
    output_bytes: int,
    run_id: str,
    run_summary: dict[str, Any],
    source_handoff: dict[str, Any],
    processed_input_bytes: int | None,
) -> dict[str, Any]:
    timestamp = generated_at(run_summary)
    source_ids = source_dataset_ids(source_handoff)
    prefix = f"product_health/gold/run_id={run_id}/"
    return {
        "contract": "CatalogMetadata",
        "producers": ["M2", "M3", "M5"],
        "consumers": ["M1", "M6"],
        "tenant_id": "tenant_demo",
        "dataset_id": DATASET_ID,
        "version": CATALOG_VERSION,
        "name": "Product Health Gold",
        "layer": "gold",
        "table_name": GOLD_TABLE_NAME,
        "pipeline_id": str(run_summary.get("pipeline_id") or PIPELINE_ID),
        "run_id": run_id,
        "s3_uri": f"s3://asklake-demo/{prefix}",
        "s3_uri_status": "local_handoff_import",
        "storage": {
            "profile": "local_handoff",
            "bucket": "asklake-demo",
            "prefix": prefix,
            "local_fallback_path": str(canonical_gold_path),
        },
        "schema": {
            "schema_version": SCHEMA_VERSION,
            "fields": CANONICAL_FIELDS,
        },
        "metrics": {
            "semantics": {
                "row_count": "output_product_rows",
                "bytes": "gold_output_bytes",
                "input_total_bytes": "processed_input_bytes_for_5gb_evidence",
            },
            "row_count": row_count,
            "bytes": output_bytes,
            "input_total_bytes": processed_input_bytes,
            "quality": {
                "schema_match": "passed",
                "risk_score_range": "passed",
                "row_count_checked": True,
                "handoff_import": "passed",
            },
        },
        "lineage": {
            "source_ids": source_ids,
            "pipeline_id": str(run_summary.get("pipeline_id") or PIPELINE_ID),
            "run_id": run_id,
            "upstream_datasets": source_ids,
            "silver_artifacts": [
                "silver/silver_user_events.parquet",
                "silver/silver_product_reviews.parquet",
                "silver/silver_product_catalog.parquet",
                "silver/silver_delivery_trip_logs.parquet",
                "silver/seed_product_mapping.parquet",
            ],
        },
        "query": {
            "table_name": GOLD_TABLE_NAME,
            "allow_readonly_sql": True,
            "allowed_columns": CANONICAL_COLUMNS,
            "default_limit": 100,
            "timeout_seconds": 30,
            "canonical_demo_query": (
                "SELECT product_id, product_name, normalized_brand, unified_category, "
                "ecommerce_product_id, amazon_parent_asin, risk_score, negative_review_rate, "
                "conversion_rate, late_delivery_rate FROM gold_product_health "
                "ORDER BY risk_score DESC LIMIT 10"
            ),
        },
        "handoff": {
            "source_version": source_handoff.get("version"),
            "evidence_mode": run_summary.get("evidence_mode"),
            "available_source_total_bytes": run_summary.get("available_source_total_bytes"),
            "processed_input_total_bytes": processed_input_bytes,
            "gold_output_row_count": row_count,
            "gold_output_bytes": output_bytes,
            "silver_user_facing": False,
        },
        "m3_contract_refs": {
            "product_health_gold_contract_ref": "contracts/product_health_gold_contract.sample.json",
            "risk_score_policy_ref": "contracts/product_health_risk_score_policy.sample.json",
            "transform_spec_ref": "contracts/product_health_transform_spec.sample.json",
            "schema_definition_ref": "contracts/product_health_schema_definition.sample.json",
        },
        "updated_at": timestamp,
    }


def build_run_metadata(
    canonical_gold_path: Path,
    row_count: int,
    output_bytes: int,
    run_id: str,
    run_summary: dict[str, Any],
    source_handoff: dict[str, Any],
    processed_input_bytes: int | None,
) -> dict[str, Any]:
    timestamp = generated_at(run_summary)
    source_ids = source_dataset_ids(source_handoff)
    task_results = source_task_results(run_summary) + [
        {
            "node_id": "node_import_product_health_gold_handoff",
            "status": "succeeded",
            "attempt": 1,
            "row_count": row_count,
            "bytes": output_bytes,
            "error": None,
        }
    ]
    duration_ms = sum(int(task.get("duration_ms") or 0) for task in task_results)
    return {
        "contract": "ExecutionResult",
        "producers": ["M2", "M3", "M5"],
        "consumers": ["M1", "M5", "M6"],
        "tenant_id": "tenant_demo",
        "run_id": run_id,
        "pipeline_id": str(run_summary.get("pipeline_id") or PIPELINE_ID),
        "executor": "handoff_importer",
        "status": "succeeded",
        "triggered_by": "product_health_handoff_import",
        "timestamps": {
            "started_at": timestamp,
            "finished_at": timestamp,
        },
        "row_count": primary_processed_row_count(run_summary),
        "bytes": processed_input_bytes,
        "duration_ms": duration_ms,
        "metric_semantics": {
            "row_count": "primary_or_measured_input_rows_processed",
            "bytes": "processed_input_bytes",
            "duration_ms": "handoff_source_scan_duration_milliseconds_plus_import_task",
            "output_row_count": "gold_output_rows",
            "output_bytes": "gold_output_bytes",
        },
        "outputs": [
            {
                "dataset_id": DATASET_ID,
                "layer": "gold",
                "uri": f"s3://asklake-demo/product_health/gold/run_id={run_id}/",
                "uri_status": "local_handoff_import",
                "local_fallback_path": str(canonical_gold_path),
            }
        ],
        "task_results": task_results,
        "lineage": {
            "source_ids": source_ids,
            "input_datasets": source_ids,
            "output_datasets": [DATASET_ID],
        },
        "logs": [
            {
                "level": "info",
                "message": "Product Health handoff imported as canonical Gold CatalogMetadata for Week 2 AI Query.",
            }
        ],
        "error": None,
        "output_path": str(canonical_gold_path),
        "output_row_count": row_count,
        "output_bytes": output_bytes,
    }


def source_task_results(run_summary: dict[str, Any]) -> list[dict[str, Any]]:
    tasks = []
    for source in run_summary.get("sources", []):
        source_name = str(source.get("source") or source.get("source_dataset_id") or "source")
        tasks.append(
            {
                "node_id": f"node_source_{source_name}",
                "status": "succeeded",
                "attempt": 1,
                "row_count": source.get("row_count_processed") or source.get("row_count_sample"),
                "bytes": source.get("processed_input_bytes")
                if source.get("processed_input_bytes") not in (None, 0)
                else source.get("bytes"),
                "duration_ms": source.get("duration_ms"),
                "source_dataset_id": source.get("source_dataset_id"),
                "bytes_semantics": source.get("bytes_semantics"),
                "error": None,
            }
        )
    return tasks


def source_dataset_ids(source_handoff: dict[str, Any]) -> list[str]:
    source_datasets = source_handoff.get("source_datasets", [])
    source_ids = [
        str(source["source_dataset_id"])
        for source in source_datasets
        if isinstance(source, dict) and source.get("source_dataset_id")
    ]
    return source_ids or [
        "source_reviews_seed",
        "source_behavior_events_seed",
        "source_delivery_trips_seed",
        "source_product_master_seed",
    ]


def load_run_summary(handoff_root: Path, evidence_profile: str) -> dict[str, Any]:
    filename = "product_health_5gb_run_summary.json" if evidence_profile == "5gb" else "product_health_run_summary.json"
    return read_json(handoff_root / "evidence" / filename)


def measured_processed_input_bytes(run_summary: dict[str, Any]) -> int | None:
    value = run_summary.get("processed_input_total_bytes")
    if value is None:
        value = run_summary.get("input_total_bytes")
    return int(value) if value is not None else None


def primary_processed_row_count(run_summary: dict[str, Any]) -> int | None:
    rows = [
        int(source["row_count_processed"])
        for source in run_summary.get("sources", [])
        if source.get("row_count_processed") is not None
    ]
    if rows:
        return max(rows)
    sample_rows = [
        int(source["row_count_sample"])
        for source in run_summary.get("sources", [])
        if source.get("row_count_sample") is not None
    ]
    return max(sample_rows) if sample_rows else None


def generated_at(run_summary: dict[str, Any]) -> str:
    return str(run_summary.get("generated_at") or datetime.now(UTC).isoformat())


def read_json(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"JSON file must contain an object: {path}")
    return payload


def resolve_repo_path(path: Path) -> Path:
    return path if path.is_absolute() else REPO_ROOT / path


def as_string(value: Any) -> str | None:
    if value in (None, ""):
        return None
    return str(value)


def as_int(value: Any) -> int:
    if value in (None, ""):
        return 0
    return int(value)


def as_float(value: Any) -> float | None:
    if value in (None, ""):
        return None
    return float(value)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("handoff_root", type=Path, help="Path to product-health-demo-dataset-handoff")
    parser.add_argument("--output-root", type=Path, default=Path("data/results/week2"))
    parser.add_argument("--archive-root", type=Path, default=Path("data/local_sources/product_health/handoff"))
    parser.add_argument("--no-archive", action="store_true", help="Skip copying handoff files into local ignored data storage")
    parser.add_argument("--run-id", default=None)
    parser.add_argument("--evidence-profile", choices=["5gb", "smoke"], default="5gb")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    archive_root = None if args.no_archive else args.archive_root
    result = import_handoff(
        ImportConfig(
            handoff_root=args.handoff_root,
            output_root=args.output_root,
            archive_root=archive_root,
            run_id=args.run_id,
            evidence_profile=args.evidence_profile,
        )
    )
    print(json.dumps(result.as_dict(), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
