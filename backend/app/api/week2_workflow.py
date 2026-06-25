from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.domain.schemas import Week2WorkflowRunRequest
from app.services.week2_workflow import Week2WorkflowNotFoundError, Week2WorkflowService


def create_week2_workflow_router(week2_workflow_service: Week2WorkflowService) -> APIRouter:
    router = APIRouter(prefix="/api/week2")

    @router.post("/workflows/{pipeline_id}/runs", status_code=status.HTTP_201_CREATED)
    def trigger_workflow_run(
        pipeline_id: str,
        request: Week2WorkflowRunRequest | None = None,
    ) -> dict[str, Any]:
        run_request = request or Week2WorkflowRunRequest()
        try:
            return week2_workflow_service.trigger_run(
                pipeline_id=pipeline_id,
                executor=run_request.executor,
                triggered_by=run_request.triggered_by,
            )
        except Week2WorkflowNotFoundError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @router.get("/runs/{run_id}")
    def get_workflow_run(run_id: str) -> dict[str, Any]:
        try:
            return week2_workflow_service.get_run(run_id)
        except Week2WorkflowNotFoundError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    @router.get("/catalog/{dataset_id}")
    def get_catalog_metadata(dataset_id: str) -> dict[str, Any]:
        try:
            return week2_workflow_service.get_catalog_metadata(dataset_id)
        except Week2WorkflowNotFoundError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    return router
