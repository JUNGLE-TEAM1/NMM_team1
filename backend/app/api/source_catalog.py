import sqlite3

from fastapi import APIRouter, HTTPException, status

from app.adapters.csv_source import CsvInspectionError
from app.domain.schemas import (
    CatalogDataset,
    ExternalConnectionCreate,
    ExternalConnectionRecord,
    ExternalTableSchema,
    SourceCreate,
    SourceDatasetCreate,
    SourceDatasetRecord,
    SourceRecord,
    SourceRegistration,
    TargetDatasetCreate,
    TargetDatasetRecord,
    TrustGateEvaluationRequest,
)
from app.domain.target_contracts import TrustGateResult
from app.ports.metadata_store import MetadataStore
from app.services.catalog_trust import CatalogTrustService
from app.services.external_connections import (
    ExternalConnectionDependencyError,
    ExternalConnectionError,
    ExternalConnectionSecretError,
    ExternalTableNotFoundError,
    PostgresSchemaInspector,
)
from app.services.source_catalog import SourceCatalogService


TEST_CONNECTION_ID = "connection_test_preview"


def create_source_catalog_router(
    metadata_store: MetadataStore,
    catalog_service: SourceCatalogService,
    catalog_trust_service: CatalogTrustService,
    schema_inspector: PostgresSchemaInspector | None = None,
) -> APIRouter:
    router = APIRouter(prefix="/api")
    postgres_schema_inspector = schema_inspector or PostgresSchemaInspector()

    @router.post("/sources", response_model=SourceRegistration, status_code=status.HTTP_201_CREATED)
    def create_source(source: SourceCreate) -> SourceRegistration:
        try:
            source_record, dataset = catalog_service.register_source(source)
        except CsvInspectionError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error
        except sqlite3.IntegrityError as error:
            raise HTTPException(status_code=409, detail=f"Source name already exists: {source.name}") from error
        return SourceRegistration(source=source_record, dataset=dataset)

    @router.get("/sources", response_model=list[SourceRecord])
    def list_sources() -> list[SourceRecord]:
        return metadata_store.list_sources()

    @router.get("/sources/{source_id}", response_model=SourceRecord)
    def get_source(source_id: str) -> SourceRecord:
        source = metadata_store.get_source(source_id)
        if source is None:
            raise HTTPException(status_code=404, detail="Source not found")
        return source

    @router.post("/external-connections", response_model=ExternalConnectionRecord, status_code=status.HTTP_201_CREATED)
    def create_external_connection(source_connection: ExternalConnectionCreate) -> ExternalConnectionRecord:
        try:
            return metadata_store.create_external_connection(source_connection)
        except sqlite3.IntegrityError as error:
            raise HTTPException(
                status_code=409,
                detail=f"External connection name already exists: {source_connection.name}",
            ) from error

    @router.post("/external-connections/test", response_model=ExternalTableSchema)
    def test_external_connection(source_connection: ExternalConnectionCreate) -> ExternalTableSchema:
        test_connection = ExternalConnectionRecord(
            id=TEST_CONNECTION_ID,
            name=source_connection.name,
            connection_type=source_connection.connection_type,
            host=source_connection.host,
            port=source_connection.port,
            database=source_connection.database,
            username=source_connection.username,
            password_secret_ref=source_connection.password_secret_ref,
            default_schema=source_connection.default_schema,
            default_table=source_connection.default_table,
            status="test_pending",
            created_at="",
            updated_at="",
        )
        try:
            return postgres_schema_inspector.inspect_table(
                test_connection,
                source_connection.default_schema,
                source_connection.default_table,
            )
        except ExternalConnectionDependencyError as error:
            raise HTTPException(status_code=503, detail=str(error)) from error
        except ExternalConnectionSecretError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error
        except ExternalTableNotFoundError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error
        except ExternalConnectionError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error

    @router.get("/external-connections", response_model=list[ExternalConnectionRecord])
    def list_external_connections() -> list[ExternalConnectionRecord]:
        return metadata_store.list_external_connections()

    @router.get("/external-connections/{connection_id}", response_model=ExternalConnectionRecord)
    def get_external_connection(connection_id: str) -> ExternalConnectionRecord:
        source_connection = metadata_store.get_external_connection(connection_id)
        if source_connection is None:
            raise HTTPException(status_code=404, detail="External connection not found")
        return source_connection

    @router.get(
        "/external-connections/{connection_id}/schemas/{schema_name}/tables/{table_name}",
        response_model=ExternalTableSchema,
    )
    def get_external_table_schema(connection_id: str, schema_name: str, table_name: str) -> ExternalTableSchema:
        source_connection = metadata_store.get_external_connection(connection_id)
        if source_connection is None:
            raise HTTPException(status_code=404, detail="External connection not found")
        try:
            return postgres_schema_inspector.inspect_table(source_connection, schema_name, table_name)
        except ExternalConnectionDependencyError as error:
            raise HTTPException(status_code=503, detail=str(error)) from error
        except ExternalConnectionSecretError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error
        except ExternalTableNotFoundError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error
        except ExternalConnectionError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error

    @router.post("/source-datasets", response_model=SourceDatasetRecord, status_code=status.HTTP_201_CREATED)
    def create_source_dataset(dataset: SourceDatasetCreate) -> SourceDatasetRecord:
        try:
            return metadata_store.create_source_dataset(dataset)
        except sqlite3.IntegrityError as error:
            raise HTTPException(status_code=409, detail=f"Source dataset name already exists: {dataset.name}") from error

    @router.get("/source-datasets", response_model=list[SourceDatasetRecord])
    def list_source_datasets() -> list[SourceDatasetRecord]:
        return metadata_store.list_source_datasets()

    @router.get("/source-datasets/{dataset_id}", response_model=SourceDatasetRecord)
    def get_source_dataset(dataset_id: str) -> SourceDatasetRecord:
        dataset = metadata_store.get_source_dataset(dataset_id)
        if dataset is None:
            raise HTTPException(status_code=404, detail="Source dataset not found")
        return dataset

    @router.post("/target-datasets", response_model=TargetDatasetRecord, status_code=status.HTTP_201_CREATED)
    def create_target_dataset(dataset: TargetDatasetCreate) -> TargetDatasetRecord:
        source_dataset = metadata_store.get_source_dataset(dataset.source_dataset_id)
        if source_dataset is None:
            raise HTTPException(status_code=404, detail="Source dataset not found")
        try:
            return metadata_store.create_target_dataset(dataset)
        except sqlite3.IntegrityError as error:
            raise HTTPException(status_code=409, detail=f"Target dataset name already exists: {dataset.name}") from error

    @router.get("/target-datasets", response_model=list[TargetDatasetRecord])
    def list_target_datasets() -> list[TargetDatasetRecord]:
        return metadata_store.list_target_datasets()

    @router.get("/target-datasets/{dataset_id}", response_model=TargetDatasetRecord)
    def get_target_dataset(dataset_id: str) -> TargetDatasetRecord:
        dataset = metadata_store.get_target_dataset(dataset_id)
        if dataset is None:
            raise HTTPException(status_code=404, detail="Target dataset not found")
        return dataset

    @router.get("/catalog/datasets", response_model=list[CatalogDataset])
    def list_catalog_datasets() -> list[CatalogDataset]:
        return metadata_store.list_catalog_datasets()

    @router.get("/catalog/datasets/{dataset_id}", response_model=CatalogDataset)
    def get_catalog_dataset(dataset_id: str) -> CatalogDataset:
        dataset = metadata_store.get_catalog_dataset(dataset_id)
        if dataset is None:
            raise HTTPException(status_code=404, detail="Catalog dataset not found")
        return dataset

    @router.post("/catalog/datasets/{dataset_id}/trust-gate", response_model=TrustGateResult)
    def evaluate_trust_gate(dataset_id: str, request: TrustGateEvaluationRequest) -> TrustGateResult:
        dataset = metadata_store.get_catalog_dataset(dataset_id)
        if dataset is None:
            raise HTTPException(status_code=404, detail="Catalog dataset not found")
        gate = catalog_trust_service.evaluate_publish_gate(dataset_id, request.passed_gates, request.failed_gates)
        metadata_store.update_catalog_dataset_trust(
            dataset_id=dataset_id,
            owner=request.owner or dataset.owner,
            trust_status=gate.status.value,
            trust_gate_result=gate.model_dump(mode="json"),
        )
        return gate

    return router
