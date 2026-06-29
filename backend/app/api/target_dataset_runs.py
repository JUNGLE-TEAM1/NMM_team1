from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.domain.schemas import TargetDatasetRunCreate, TargetDatasetRunRecord
from app.ports.metadata_store import MetadataStore
from app.services.week2_workflow import (
    Week2WorkflowInvalidExecutorError,
    Week2WorkflowNotFoundError,
    Week2WorkflowService,
)

TARGET_DATASET_HANDOFF_PIPELINE_ID = "pipeline_reviews_json_e2e"


def create_target_dataset_run_router(
    metadata_store: MetadataStore,
    week2_workflow_service: Week2WorkflowService,
) -> APIRouter:
    router = APIRouter(prefix="/api")

    @router.post(
        "/target-datasets/{dataset_id}/runs",
        response_model=TargetDatasetRunRecord,
        status_code=status.HTTP_201_CREATED,
    )
    def create_target_dataset_run(
        dataset_id: str,
        request: TargetDatasetRunCreate | None = None,
    ) -> TargetDatasetRunRecord:
        target_dataset = metadata_store.get_target_dataset(dataset_id)
        if target_dataset is None:
            raise HTTPException(status_code=404, detail="Target dataset not found")

        run_request = request or TargetDatasetRunCreate()
        try:
            execution_result = week2_workflow_service.trigger_run(
                pipeline_id=TARGET_DATASET_HANDOFF_PIPELINE_ID,
                executor=run_request.executor,
                triggered_by=run_request.triggered_by,
            )
        except Week2WorkflowNotFoundError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error
        except Week2WorkflowInvalidExecutorError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error

        handoff_result = execution_result_with_target_handoff(execution_result, target_dataset.model_dump(mode="json"))
        return metadata_store.create_target_dataset_run(target_dataset, handoff_result)

    @router.get("/target-datasets/{dataset_id}/runs", response_model=list[TargetDatasetRunRecord])
    def list_target_dataset_runs(dataset_id: str) -> list[TargetDatasetRunRecord]:
        target_dataset = metadata_store.get_target_dataset(dataset_id)
        if target_dataset is None:
            raise HTTPException(status_code=404, detail="Target dataset not found")
        return metadata_store.list_target_dataset_runs(dataset_id)

    @router.get("/target-dataset-runs/{run_record_id}", response_model=TargetDatasetRunRecord)
    def get_target_dataset_run(run_record_id: str) -> TargetDatasetRunRecord:
        run_record = metadata_store.get_target_dataset_run(run_record_id)
        if run_record is None:
            raise HTTPException(status_code=404, detail="Target dataset run not found")
        return run_record

    return router


def execution_result_with_target_handoff(
    execution_result: dict[str, Any],
    target_dataset: dict[str, Any],
) -> dict[str, Any]:
    next_result = dict(execution_result)
    next_result["target_dataset_handoff"] = {
        "target_dataset_id": target_dataset["id"],
        "target_dataset_name": target_dataset["name"],
        "job_definition_status": target_dataset["job_definition"]["status"],
        "source_dataset_id": target_dataset["source_dataset_id"],
        "selected_fields": target_dataset["selected_fields"],
    }
    return next_result
