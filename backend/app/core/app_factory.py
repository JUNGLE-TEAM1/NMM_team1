from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.pipelines import create_pipeline_router
from app.api.source_catalog import create_source_catalog_router
from app.api.target_dataset_runs import create_target_dataset_run_router
from app.api.week2_ai_query import create_week2_ai_query_router
from app.api.week2_kafka_replay import create_week2_kafka_replay_router
from app.api.week2_workflow import create_week2_workflow_router
from app.core.container import AppContainer
from app.core.settings import Settings, get_settings
from app.ports.metadata_store import MetadataStore
from app.services.external_connections import ExternalSchemaInspector


def create_app(
    store: MetadataStore | None = None,
    settings: Settings | None = None,
    schema_inspector: ExternalSchemaInspector | None = None,
) -> FastAPI:
    app_settings = settings or get_settings()
    app = FastAPI(title=app_settings.app_name)
    container = AppContainer(app_settings, metadata_store=store)
    container.metadata_store.initialize()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(
        create_source_catalog_router(
            container.metadata_store,
            container.source_catalog_service,
            container.catalog_trust_service,
            schema_inspector=schema_inspector,
        )
    )
    app.include_router(
        create_pipeline_router(
            container.metadata_store,
            container.pipeline_service,
        )
    )
    app.include_router(
        create_target_dataset_run_router(
            container.metadata_store,
            container.week2_workflow_service,
        )
    )
    app.include_router(create_week2_workflow_router(container.week2_workflow_service))
    app.include_router(create_week2_kafka_replay_router(container.week2_kafka_replay_evidence_service))
    app.include_router(create_week2_ai_query_router(container.ai_query_service))

    return app
