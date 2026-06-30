from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pyarrow.parquet as pq

from app.domain.schemas import (
    ColumnSchema,
    ExternalConnectionInspectRequest,
    ProductHealthSourceInventory,
    ProductHealthSourceInventoryItem,
)
from app.services.external_connection_discovery import ExternalConnectionDiscoveryError, ExternalConnectionDiscoveryService


ROOT = Path("data/local_sources/product_health")


@dataclass(frozen=True)
class ProductHealthSourceSpec:
    role: str
    label: str
    source_dataset_name: str
    connection_name: str
    raw_path: Path | None
    prepared_path: Path | None
    raw_resource_label: str = "file_path"


SOURCE_SPECS = [
    ProductHealthSourceSpec(
        role="behavior_events",
        label="Commerce behavior events",
        source_dataset_name="source_user_events",
        connection_name="conn_product_health_behavior_events",
        raw_path=ROOT / "raw/kaggle_ecommerce_behavior/2019-Oct.csv",
        prepared_path=ROOT / "silver/silver_user_events.parquet",
    ),
    ProductHealthSourceSpec(
        role="reviews",
        label="Reviews / VOC",
        source_dataset_name="source_product_reviews",
        connection_name="conn_product_health_reviews",
        raw_path=ROOT / "raw/amazon_reviews_2023/reviews.jsonl",
        prepared_path=ROOT / "silver/silver_product_reviews.parquet",
    ),
    ProductHealthSourceSpec(
        role="product_catalog",
        label="Product catalog / MEP metadata",
        source_dataset_name="source_product_catalog",
        connection_name="conn_product_health_product_catalog",
        raw_path=ROOT / "raw/mep_3m/annotations.json",
        prepared_path=ROOT / "silver/silver_product_catalog.parquet",
    ),
    ProductHealthSourceSpec(
        role="delivery_trip_logs",
        label="Delivery / trip logs",
        source_dataset_name="source_delivery_trip_logs",
        connection_name="conn_product_health_delivery_trips",
        raw_path=ROOT / "raw/taxi/trips.parquet",
        prepared_path=ROOT / "silver/silver_delivery_trip_logs.parquet",
    ),
]


class ProductHealthSourceInventoryService:
    def list_inventory(self) -> ProductHealthSourceInventory:
        sources = [self._build_item(spec) for spec in SOURCE_SPECS]
        ready_count = sum(1 for source in sources if source.status == "ready")
        if ready_count == len(sources):
            status = "ready"
        elif ready_count > 0:
            status = "partial"
        else:
            status = "missing"
        return ProductHealthSourceInventory(
            status=status,
            sources=sources,
            message=f"{ready_count}/{len(sources)} Product Health source candidates are ready.",
        )

    def _build_item(self, spec: ProductHealthSourceSpec) -> ProductHealthSourceInventoryItem:
        if spec.raw_path and spec.raw_path.exists():
            return self._file_item(spec, spec.raw_path, "raw_file", spec.raw_resource_label)
        if spec.prepared_path and spec.prepared_path.exists():
            return self._file_item(spec, spec.prepared_path, "prepared_dataset", "dataset_path")
        expected_path = spec.raw_path or spec.prepared_path or ROOT
        return ProductHealthSourceInventoryItem(
            role=spec.role,
            label=spec.label,
            source_dataset_name=spec.source_dataset_name,
            connection_name=spec.connection_name,
            connection_type="local_file",
            resource_label=spec.raw_resource_label,
            path=str(expected_path),
            binding_type="missing",
            status="missing",
            can_create_source_dataset=False,
            message=f"Product Health source file is missing: {expected_path}",
        )

    def _file_item(
        self,
        spec: ProductHealthSourceSpec,
        path: Path,
        binding_type: str,
        resource_label: str,
    ) -> ProductHealthSourceInventoryItem:
        schema_preview, row_count, row_count_status, message = inspect_path(path)
        return ProductHealthSourceInventoryItem(
            role=spec.role,
            label=spec.label,
            source_dataset_name=spec.source_dataset_name,
            connection_name=spec.connection_name,
            connection_type="local_file",
            resource_label=resource_label,
            path=str(path),
            binding_type=binding_type,
            status="ready",
            can_create_source_dataset=bool(schema_preview),
            bytes=path.stat().st_size,
            row_count=row_count,
            row_count_status=row_count_status,
            schema_preview=schema_preview,
            message=message,
        )


def inspect_path(path: Path) -> tuple[list[ColumnSchema], int | None, str, str]:
    if path.suffix.lower() == ".parquet":
        parquet_file = pq.ParquetFile(path)
        schema_preview = [ColumnSchema(name=field.name, type=str(field.type)) for field in parquet_file.schema_arrow]
        row_count = parquet_file.metadata.num_rows if parquet_file.metadata is not None else None
        return schema_preview, row_count, "metadata", "Prepared parquet dataset is available."
    try:
        result = ExternalConnectionDiscoveryService().inspect(
            ExternalConnectionInspectRequest(
                connector_type="local_file",
                resource=str(path),
                resource_label="file_path",
                sample_size=5,
            )
        )
    except ExternalConnectionDiscoveryError:
        return [], None, "inspect_failed", "File exists but schema inspection failed."
    return result.schema_preview, result.row_count, result.row_count_status, result.message
