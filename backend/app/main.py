import sqlite3

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.catalog_service import SourceCatalogService
from app.csv_inspector import CsvInspectionError
from app.metadata_store import MetadataStore, SQLiteMetadataStore
from app.schemas import CatalogDataset, SourceCreate, SourceRecord, SourceRegistration


def create_app(store: MetadataStore | None = None) -> FastAPI:
    app = FastAPI(title="AskLake API")
    metadata_store = store or SQLiteMetadataStore()
    metadata_store.initialize()
    catalog_service = SourceCatalogService(metadata_store)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:13000",
            "http://127.0.0.1:13000",
        ],
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return health_payload()

    @app.get("/api/health")
    def api_health() -> dict[str, str]:
        return health_payload()

    @app.post("/api/sources", response_model=SourceRegistration, status_code=status.HTTP_201_CREATED)
    def create_source(source: SourceCreate) -> SourceRegistration:
        try:
            source_record, dataset = catalog_service.register_source(source)
        except CsvInspectionError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error
        except sqlite3.IntegrityError as error:
            raise HTTPException(status_code=409, detail=f"Source name already exists: {source.name}") from error
        return SourceRegistration(source=source_record, dataset=dataset)

    @app.get("/api/sources", response_model=list[SourceRecord])
    def list_sources() -> list[SourceRecord]:
        return metadata_store.list_sources()

    @app.get("/api/sources/{source_id}", response_model=SourceRecord)
    def get_source(source_id: str) -> SourceRecord:
        source = metadata_store.get_source(source_id)
        if source is None:
            raise HTTPException(status_code=404, detail="Source not found")
        return source

    @app.get("/api/catalog/datasets", response_model=list[CatalogDataset])
    def list_catalog_datasets() -> list[CatalogDataset]:
        return metadata_store.list_catalog_datasets()

    @app.get("/api/catalog/datasets/{dataset_id}", response_model=CatalogDataset)
    def get_catalog_dataset(dataset_id: str) -> CatalogDataset:
        dataset = metadata_store.get_catalog_dataset(dataset_id)
        if dataset is None:
            raise HTTPException(status_code=404, detail="Catalog dataset not found")
        return dataset

    return app


def health_payload() -> dict[str, str]:
    return {
        "service": "asklake-backend",
        "status": "ok",
        "app": "AskLake",
    }


app = create_app()
