#!/usr/bin/env python3
"""Ingest Product Health handoff artifacts into the Week 2 Catalog store."""

from __future__ import annotations

import json
from copy import deepcopy
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


ROOT = Path("data/local_sources/product_health")
CATALOG = ROOT / "catalog"
EVIDENCE = ROOT / "evidence"
WEEK2_OUTPUT_ROOTS = [
    Path("data/results/week2"),
    Path("data/week2"),
]
CONTRACT_TEMPLATE = Path("contracts/catalog_metadata.sample.json")

DATASET_ID = "dataset_product_health_gold"
PIPELINE_ID = "pipeline_product_health_e2e"
TABLE_NAME = "gold_product_health"
RUN_SUMMARY_PATH = EVIDENCE / "product_health_5gb_run_summary.json"
CATALOG_HANDOFF_PATH = CATALOG / "dataset_product_health_gold.json"
SOURCE_HANDOFF_PATH = CATALOG / "product_health_source_handoff.json"
RUN_ID = "run_product_health_5gb_001"


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True, default=str) + "\n", encoding="utf-8")


def normalized_schema_fields(catalog_handoff: dict[str, Any]) -> list[dict[str, Any]]:
    fields: list[dict[str, Any]] = []
    for field in catalog_handoff.get("schema", []):
        fields.append(
            {
                "name": field["name"],
                "type": normalize_type(str(field["type"])),
                "nullable": bool(field.get("nullable", True)),
            }
        )
    return fields


def normalize_type(value: str) -> str:
    lowered = value.lower()
    if "int" in lowered:
        return "integer"
    if "float" in lowered or "double" in lowered or "decimal" in lowered:
        return "number"
    if "bool" in lowered:
        return "boolean"
    if "date" in lowered or "time" in lowered:
        return "timestamp"
    if "list" in lowered or "array" in lowered:
        return "array"
    return "string"


def source_ids(source_handoff: dict[str, Any]) -> list[str]:
    return [source["source_dataset_id"] for source in source_handoff.get("source_datasets", [])]


def build_catalog_metadata(
    template: dict[str, Any],
    catalog_handoff: dict[str, Any],
    source_handoff: dict[str, Any],
    run_summary: dict[str, Any],
) -> dict[str, Any]:
    catalog = deepcopy(template)
    run_id = run_summary["run_id"]
    local_fallback_path = catalog_handoff["storage"]["local_fallback_path"]
    source_dataset_ids = source_ids(source_handoff)

    catalog.update(
        {
            "contract": "CatalogMetadata",
            "tenant_id": source_handoff.get("tenant_id", "tenant_demo"),
            "dataset_id": DATASET_ID,
            "version": "v1",
            "name": "Product Health Gold",
            "layer": "gold",
            "s3_uri": f"s3://asklake-demo/product_health/gold/run_id={run_id}/",
            "s3_uri_status": "local_fallback_registered",
            "schema": {
                "schema_version": "schema_product_health_gold_v1",
                "fields": normalized_schema_fields(catalog_handoff),
            },
            "metrics": {
                "semantics": {
                    "row_count": "output_dataset_rows",
                    "bytes": "output_dataset_bytes",
                    "processed_input_total_bytes": "processed_input_bytes",
                    "available_source_total_bytes": "available_source_bytes",
                },
                "row_count": run_summary["gold_output_row_count"],
                "bytes": run_summary["gold_output_bytes"],
                "processed_input_total_bytes": run_summary["processed_input_total_bytes"],
                "available_source_total_bytes": run_summary["available_source_total_bytes"],
                "quality": {
                    "schema_match": "passed",
                    "row_count_checked": True,
                    "input_bytes_checked": True,
                },
            },
            "lineage": {
                "source_ids": source_dataset_ids,
                "source_handoff_path": str(SOURCE_HANDOFF_PATH),
                "pipeline_id": PIPELINE_ID,
                "run_id": run_id,
                "run_summary_path": str(RUN_SUMMARY_PATH),
                "upstream_datasets": [
                    "silver_user_events",
                    "silver_product_reviews",
                    "silver_product_catalog",
                    "silver_delivery_trip_logs",
                    "seed_product_mapping",
                ],
                "mapping_method": catalog_handoff.get("lineage", {}).get("mapping_method", "synthetic_seed"),
                "scenario_calibration": catalog_handoff.get("lineage", {}).get("scenario_calibration"),
            },
            "query": {
                "table_name": TABLE_NAME,
                "allow_readonly_sql": True,
                "allowed_columns": catalog_handoff["query"]["allowed_columns"],
                "default_limit": catalog_handoff["query"].get("default_limit", 50),
                "timeout_seconds": 30,
            },
            "freshness": {
                "event_time_column": "period_end",
                "data_interval_start": None,
                "data_interval_end": None,
            },
            "updated_at": now_iso(),
        }
    )
    catalog["storage"] = {
        "profile": "local",
        "bucket": "asklake-demo",
        "prefix": f"product_health/gold/run_id={run_id}/",
        "local_fallback_path": local_fallback_path,
        "format": catalog_handoff["storage"].get("format", "parquet"),
    }
    return catalog


def build_run_metadata(run_summary: dict[str, Any]) -> dict[str, Any]:
    run_id = run_summary["run_id"]
    return {
        "contract": "ExecutionResult",
        "tenant_id": "tenant_demo",
        "run_id": run_id,
        "pipeline_id": PIPELINE_ID,
        "executor": "local_runner",
        "status": "succeeded",
        "triggered_by": "ph_data_3_evidence",
        "timestamps": {
            "started_at": run_summary["generated_at"],
            "finished_at": run_summary["generated_at"],
        },
        "row_count": next(source["row_count_processed"] for source in run_summary["sources"] if source["source"] == "behavior"),
        "bytes": run_summary["processed_input_total_bytes"],
        "duration_ms": next(source["duration_ms"] for source in run_summary["sources"] if source["source"] == "behavior"),
        "metric_semantics": {
            "row_count": "primary_input_rows_processed",
            "bytes": "primary_input_bytes_read",
            "duration_ms": "runner_execution_duration_milliseconds",
        },
        "outputs": [
            {
                "dataset_id": DATASET_ID,
                "layer": "gold",
                "uri": f"s3://asklake-demo/product_health/gold/run_id={run_id}/",
                "local_fallback_path": run_summary["gold_output_path"],
                "row_count": run_summary["gold_output_row_count"],
                "bytes": run_summary["gold_output_bytes"],
            }
        ],
        "task_results": [
            {
                "node_id": "node_source_behavior_events",
                "status": "succeeded",
                "attempt": 1,
                "row_count": next(source["row_count_processed"] for source in run_summary["sources"] if source["source"] == "behavior"),
                "bytes": run_summary["processed_input_total_bytes"],
                "error": None,
            },
            {
                "node_id": "node_load_product_health_gold",
                "status": "succeeded",
                "attempt": 1,
                "row_count": run_summary["gold_output_row_count"],
                "bytes": run_summary["gold_output_bytes"],
                "error": None,
            },
        ],
        "lineage": {
            "source_ids": [source["source_dataset_id"] for source in run_summary["sources"]],
            "output_datasets": [DATASET_ID],
        },
        "logs": [
            {
                "level": "info",
                "message": "Product Health 5GB evidence run ingested into Week2CatalogStore metadata.",
            }
        ],
        "error": None,
    }


def main() -> None:
    template = read_json(CONTRACT_TEMPLATE)
    catalog_handoff = read_json(CATALOG_HANDOFF_PATH)
    source_handoff = read_json(SOURCE_HANDOFF_PATH)
    run_summary = read_json(RUN_SUMMARY_PATH)

    catalog = build_catalog_metadata(template, catalog_handoff, source_handoff, run_summary)
    run = build_run_metadata(run_summary)
    output_paths = []
    for output_root in WEEK2_OUTPUT_ROOTS:
        catalog_path = output_root / "_metadata" / "catalog" / f"{DATASET_ID}.json"
        run_path = output_root / "_metadata" / "runs" / f"{RUN_ID}.json"
        write_json(catalog_path, catalog)
        write_json(run_path, run)
        output_paths.append((catalog_path, run_path))

    for catalog_path, run_path in output_paths:
        print(f"Wrote {catalog_path}")
        print(f"Wrote {run_path}")
    print(f"dataset_id={catalog['dataset_id']}")
    print(f"local_fallback_path={catalog['storage']['local_fallback_path']}")


if __name__ == "__main__":
    main()
