from fastapi import APIRouter, HTTPException, status

from app.domain.schemas import PipelineCreate, PipelineRecord, PipelineRunRecord
from app.ports.metadata_store import MetadataStore
from app.services.pipeline import PipelineService, PipelineValidationError


def create_pipeline_router(
    metadata_store: MetadataStore,
    pipeline_service: PipelineService,
) -> APIRouter:
    router = APIRouter(prefix="/api")

    @router.post("/pipelines", response_model=PipelineRecord, status_code=status.HTTP_201_CREATED)
    def create_pipeline(pipeline: PipelineCreate) -> PipelineRecord:
        try:
            return pipeline_service.create_pipeline(pipeline)
        except PipelineValidationError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error

    @router.get("/pipelines", response_model=list[PipelineRecord])
    def list_pipelines() -> list[PipelineRecord]:
        return metadata_store.list_pipelines()

    @router.get("/pipelines/{pipeline_id}", response_model=PipelineRecord)
    def get_pipeline(pipeline_id: str) -> PipelineRecord:
        pipeline = metadata_store.get_pipeline(pipeline_id)
        if pipeline is None:
            raise HTTPException(status_code=404, detail="Pipeline not found")
        return pipeline

    @router.post("/pipelines/{pipeline_id}/runs", response_model=PipelineRunRecord, status_code=status.HTTP_201_CREATED)
    def run_pipeline(pipeline_id: str) -> PipelineRunRecord:
        try:
            return pipeline_service.run_pipeline(pipeline_id)
        except PipelineValidationError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @router.get("/pipeline-runs/{run_id}", response_model=PipelineRunRecord)
    def get_pipeline_run(run_id: str) -> PipelineRunRecord:
        run = metadata_store.get_pipeline_run(run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Pipeline run not found")
        return run

    return router
