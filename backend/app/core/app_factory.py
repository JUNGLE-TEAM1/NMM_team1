from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.api.health import router as health_router
from app.api.source_catalog import create_source_catalog_router
from app.core.settings import Settings, get_settings
from app.ports.metadata_store import MetadataStore
from app.services.source_catalog import SourceCatalogService


def create_app(store: MetadataStore | None = None, settings: Settings | None = None) -> FastAPI:
    app_settings = settings or get_settings()
    app = FastAPI(title=app_settings.app_name)
    metadata_store = store or SQLiteMetadataStore(app_settings.metadata_url)
    metadata_store.initialize()
    catalog_service = SourceCatalogService(metadata_store)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(create_source_catalog_router(metadata_store, catalog_service))

    return app
