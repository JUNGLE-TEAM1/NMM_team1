import re
from typing import Any

from app.domain.schemas import CatalogDataset
from app.ports.catalog_source import CatalogSource
from app.ports.metadata_store import MetadataStore


class SQLiteCatalogMetadataSource:
    def __init__(
        self,
        metadata_store: MetadataStore,
        fallback_source: CatalogSource | None = None,
    ) -> None:
        self.metadata_store = metadata_store
        self.fallback_source = fallback_source

    def list_catalogs(self, tenant_id: str | None = None) -> list[dict[str, Any]]:
        published_catalogs = [
            catalog_dataset_to_metadata(dataset)
            for dataset in self.metadata_store.list_catalog_datasets()
            if dataset.source_type == "target_dataset_job_run" and dataset.status == "ready"
        ]
        if self.fallback_source is None:
            return filter_by_tenant(published_catalogs, tenant_id)

        return filter_by_tenant(
            published_catalogs + self.fallback_source.list_catalogs(tenant_id),
            tenant_id,
        )


def catalog_dataset_to_metadata(dataset: CatalogDataset) -> dict[str, Any]:
    lineage = dataset.lineage or {}
    metrics = dataset.metrics or {}
    storage = dataset.storage or {}
    fields = [
        {
            "name": column.name,
            "type": column.type,
            "nullable": True,
        }
        for column in dataset.columns
    ]
    allowed_columns = [field["name"] for field in fields]
    source_refs = lineage.get("source_refs", [])
    source_ids = [
        str(source_ref.get("source_id"))
        for source_ref in source_refs
        if isinstance(source_ref, dict) and source_ref.get("source_id")
    ]

    return {
        "contract": "CatalogMetadata",
        "producers": ["M3", "M5"],
        "consumers": ["M1", "M6"],
        "tenant_id": "tenant_demo",
        "dataset_id": dataset.id,
        "version": "v1",
        "name": dataset.name,
        "layer": "gold",
        "s3_uri": None,
        "storage": {
            "profile": "local",
            "local_fallback_path": storage.get("local_path") or dataset.path,
            "format": storage.get("format", "jsonl"),
        },
        "schema": {
            "schema_version": f"schema_{safe_identifier(dataset.name)}_v1",
            "fields": fields,
        },
        "metrics": {
            "semantics": {
                "row_count": "output_dataset_rows",
                "bytes": "output_dataset_bytes",
            },
            "row_count": metrics.get("row_count", dataset.row_count),
            "bytes": metrics.get("bytes"),
            "duration_ms": metrics.get("duration_ms"),
            "source_count": metrics.get("source_count"),
            "silver_output_count": metrics.get("silver_output_count"),
            "quality": {
                "schema_match": "metadata_ready",
                "row_count_checked": dataset.row_count is not None,
            },
        },
        "lineage": {
            "run_id": lineage.get("run_id"),
            "target_dataset_draft_id": lineage.get("target_dataset_draft_id"),
            "target_dataset_name": lineage.get("target_dataset_name"),
            "source_ids": source_ids,
            "upstream_datasets": lineage.get("silver_output_paths", []),
            "processing_recipes": lineage.get("processing_recipes", []),
        },
        "query": {
            "table_name": safe_identifier(dataset.name),
            "allow_readonly_sql": True,
            "allowed_columns": allowed_columns,
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "runtime_evidence": dataset.runtime_evidence or {},
        "source_evidence": dataset.source_evidence,
        "updated_at": dataset.created_at,
    }


def safe_identifier(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9_]+", "_", value.strip())
    normalized = normalized.strip("_").lower()
    if not normalized:
        return "catalog_dataset"
    if normalized[0].isdigit():
        return f"dataset_{normalized}"
    return normalized


def filter_by_tenant(catalogs: list[dict[str, Any]], tenant_id: str | None) -> list[dict[str, Any]]:
    if tenant_id is None:
        return catalogs
    return [catalog for catalog in catalogs if catalog.get("tenant_id") == tenant_id]
