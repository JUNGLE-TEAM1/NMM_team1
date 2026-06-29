import sqlite3

from fastapi import APIRouter, HTTPException, status

from app.adapters.csv_source import CsvInspectionError
from app.domain.schemas import (
    CatalogDataset,
    SourceCreate,
    SourceDatasetCreate,
    SourceDatasetRecord,
    SourceRecord,
    SourceRegistration,
    TrustGateEvaluationRequest,
)
from app.domain.target_contracts import TrustGateResult
from app.ports.metadata_store import MetadataStore
from app.services.catalog_trust import CatalogTrustService
from app.services.source_catalog import SourceCatalogService


def create_source_catalog_router(
    metadata_store: MetadataStore,
    catalog_service: SourceCatalogService,
    catalog_trust_service: CatalogTrustService,
) -> APIRouter:
    router = APIRouter(prefix="/api")

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
