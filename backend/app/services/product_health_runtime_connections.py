from __future__ import annotations

from dataclasses import dataclass

from app.domain.schemas import (
    ColumnSchema,
    ExternalConnectionCreate,
    ExternalConnectionRecord,
    ExternalConnectionUpdate,
    ProductHealthRuntimeConnectionReadiness,
    ProductHealthRuntimeConnectionSeedResult,
)
from app.ports.metadata_store import MetadataStore


@dataclass(frozen=True)
class ProductHealthRuntimeConnectionSpec:
    role: str
    name: str
    connector_type: str
    resource: str
    resource_label: str
    source_scope: str
    detected_dataset: str
    readiness_status: str
    fallback_available: bool
    schema_preview: tuple[ColumnSchema, ...]
    sync_mode: str
    sync_schedule: str


PRODUCT_HEALTH_RUNTIME_CONNECTION_SPECS = [
    ProductHealthRuntimeConnectionSpec(
        role="behavior_events",
        name="conn_product_health_behavior_kafka",
        connector_type="kafka",
        resource="127.0.0.1:29092",
        resource_label="bootstrap_servers",
        source_scope="product-health.behavior-events",
        detected_dataset="Product Health behavior events topic",
        readiness_status="testable",
        fallback_available=True,
        schema_preview=(
            ColumnSchema(name="event_time", type="string"),
            ColumnSchema(name="event_type", type="string"),
            ColumnSchema(name="product_id", type="integer"),
            ColumnSchema(name="user_id", type="integer"),
        ),
        sync_mode="streaming",
        sync_schedule="continuous topic consumption",
    ),
    ProductHealthRuntimeConnectionSpec(
        role="product_catalog",
        name="conn_product_health_catalog_postgres",
        connector_type="postgres",
        resource="127.0.0.1:15432/asklake",
        resource_label="postgres_database",
        source_scope="public.product_catalog",
        detected_dataset="Product Health product catalog table",
        readiness_status="secret_ref_required",
        fallback_available=True,
        schema_preview=(
            ColumnSchema(name="product_id", type="string"),
            ColumnSchema(name="category_id", type="string"),
            ColumnSchema(name="brand", type="string"),
            ColumnSchema(name="product_title", type="string"),
        ),
        sync_mode="scheduled",
        sync_schedule="daily product catalog sync",
    ),
    ProductHealthRuntimeConnectionSpec(
        role="reviews",
        name="conn_product_health_reviews_mongo",
        connector_type="mongodb",
        resource="mongodb://127.0.0.1:27017/admin",
        resource_label="mongo_uri",
        source_scope="asklake.product_reviews",
        detected_dataset="Product Health reviews/VOC collection",
        readiness_status="secret_ref_required",
        fallback_available=True,
        schema_preview=(
            ColumnSchema(name="review_id", type="string"),
            ColumnSchema(name="product_id", type="string"),
            ColumnSchema(name="rating", type="number"),
            ColumnSchema(name="review_text", type="string"),
        ),
        sync_mode="scheduled",
        sync_schedule="daily review collection scan",
    ),
    ProductHealthRuntimeConnectionSpec(
        role="delivery_trip_logs",
        name="conn_product_health_delivery_s3",
        connector_type="s3",
        resource="http://127.0.0.1:9000/asklake-demo",
        resource_label="s3_bucket_endpoint",
        source_scope="s3://asklake-demo/product_health/delivery_trip_logs/",
        detected_dataset="Product Health delivery/trip object prefix",
        readiness_status="secret_ref_required",
        fallback_available=True,
        schema_preview=(
            ColumnSchema(name="delivery_id", type="string"),
            ColumnSchema(name="product_id", type="string"),
            ColumnSchema(name="delivery_duration_minutes", type="number"),
            ColumnSchema(name="late_delivery_flag", type="boolean"),
        ),
        sync_mode="scheduled",
        sync_schedule="hourly delivery object prefix scan",
    ),
]


class ProductHealthRuntimeConnectionSeedService:
    def __init__(self, metadata_store: MetadataStore):
        self.metadata_store = metadata_store

    def seed(self) -> ProductHealthRuntimeConnectionSeedResult:
        records: list[ExternalConnectionRecord] = []
        for spec in PRODUCT_HEALTH_RUNTIME_CONNECTION_SPECS:
            records.append(self._upsert(spec))

        readiness = [
            ProductHealthRuntimeConnectionReadiness(
                role=spec.role,
                connection_name=spec.name,
                connector_type=spec.connector_type,  # type: ignore[arg-type]
                runtime_resource=spec.resource,
                source_scope=spec.source_scope,
                readiness_status=spec.readiness_status,  # type: ignore[arg-type]
                fallback_available=spec.fallback_available,
                message=readiness_message(spec),
            )
            for spec in PRODUCT_HEALTH_RUNTIME_CONNECTION_SPECS
        ]
        return ProductHealthRuntimeConnectionSeedResult(
            status="seeded",
            connections=records,
            readiness=readiness,
            message="Product Health runtime connection metadata was seeded. Secret values were not stored.",
        )

    def _upsert(self, spec: ProductHealthRuntimeConnectionSpec) -> ExternalConnectionRecord:
        existing = next(
            (connection for connection in self.metadata_store.list_external_connections() if connection.name == spec.name),
            None,
        )
        if existing is not None:
            updated = self.metadata_store.update_external_connection(
                existing.id,
                ExternalConnectionUpdate(
                    resource=spec.resource,
                    resource_label=spec.resource_label,
                    auth_mode=auth_mode(spec),
                    mode_label="Product Health runtime connection seed",
                    contract_hint=contract_hint(spec),
                    detected_format=detected_format(spec),
                    detected_dataset=spec.detected_dataset,
                    confidence=confidence(spec),
                    recommended_role="Product Health Source Connection",
                    sync_mode=spec.sync_mode,  # type: ignore[arg-type]
                    sync_schedule=spec.sync_schedule,
                    schema_preview=list(spec.schema_preview),
                ),
            )
            return updated or existing

        return self.metadata_store.create_external_connection(
            ExternalConnectionCreate(
                name=spec.name,
                connector_type=spec.connector_type,  # type: ignore[arg-type]
                resource=spec.resource,
                resource_label=spec.resource_label,
                auth_mode=auth_mode(spec),
                mode_label="Product Health runtime connection seed",
                contract_hint=contract_hint(spec),
                detected_format=detected_format(spec),
                detected_dataset=spec.detected_dataset,
                confidence=confidence(spec),
                recommended_role="Product Health Source Connection",
                sync_mode=spec.sync_mode,  # type: ignore[arg-type]
                sync_schedule=spec.sync_schedule,
                schema_preview=list(spec.schema_preview),
            )
        )


def auth_mode(spec: ProductHealthRuntimeConnectionSpec) -> str:
    if spec.connector_type == "kafka":
        return "No credential in local demo"
    return "Secret reference only"


def contract_hint(spec: ProductHealthRuntimeConnectionSpec) -> str:
    if spec.connector_type == "kafka":
        return f"Runtime source: Kafka broker {spec.resource}; Source Dataset scope: topic {spec.source_scope}"
    if spec.connector_type == "postgres":
        return f"Runtime source: PostgreSQL database {spec.resource}; Source Dataset scope: table {spec.source_scope}; raw credential values forbidden"
    if spec.connector_type == "mongodb":
        return f"Runtime source: MongoDB URI {spec.resource}; Source Dataset scope: collection {spec.source_scope}; raw credential values forbidden"
    return f"Runtime source: S3/MinIO bucket endpoint {spec.resource}; Source Dataset scope: prefix {spec.source_scope}; raw credential values forbidden"


def detected_format(spec: ProductHealthRuntimeConnectionSpec) -> str:
    labels = {
        "kafka": "Kafka topic",
        "postgres": "PostgreSQL table",
        "mongodb": "MongoDB collection",
        "s3": "S3/MinIO object prefix",
    }
    return labels.get(spec.connector_type, spec.connector_type)


def confidence(spec: ProductHealthRuntimeConnectionSpec) -> str:
    if spec.readiness_status == "testable":
        return "Runtime test available"
    return "Secret ref required"


def readiness_message(spec: ProductHealthRuntimeConnectionSpec) -> str:
    if spec.readiness_status == "testable":
        return "Local runtime can be tested without storing credentials; consume/replay remains a later phase."
    return "Runtime metadata is seeded, but connection test requires secret_ref env names; raw secret values must not be stored."
