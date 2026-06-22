import sqlite3

from fastapi import APIRouter, HTTPException, status

from app.adapters.csv_source import CsvInspectionError
from app.domain.schemas import CatalogDataset, SourceCreate, SourceRecord, SourceRegistration
from app.ports.metadata_store import MetadataStore
from app.services.source_catalog import SourceCatalogService


def create_source_catalog_router(
    metadata_store: MetadataStore,
    catalog_service: SourceCatalogService,
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

    @router.get("/catalog/datasets", response_model=list[CatalogDataset])
    def list_catalog_datasets() -> list[CatalogDataset]:
        return metadata_store.list_catalog_datasets()

    @router.get("/catalog/datasets/{dataset_id}", response_model=CatalogDataset)
    def get_catalog_dataset(dataset_id: str) -> CatalogDataset:
        dataset = metadata_store.get_catalog_dataset(dataset_id)
        if dataset is None:
            raise HTTPException(status_code=404, detail="Catalog dataset not found")
        return dataset

    return router
