from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.domain.schemas import TargetDatasetRunCreate, TargetDatasetRunRecord
from app.ports.metadata_store import MetadataStore
from app.services.week2_workflow import (
    Week2WorkflowInvalidExecutorError,
    Week2WorkflowNotFoundError,
    Week2WorkflowService,
)
from app.services.product_health_manual_run_contract import ProductHealthManualRunContractService
from app.services.product_health_manual_run_execution import ProductHealthManualRunExecutionService

TARGET_DATASET_HANDOFF_PIPELINE_ID = "pipeline_reviews_json_e2e"
product_health_manual_run_contract_service = ProductHealthManualRunContractService()


def create_target_dataset_run_router(
    metadata_store: MetadataStore,
    week2_workflow_service: Week2WorkflowService,
    product_health_execution_service: ProductHealthManualRunExecutionService | None = None,
) -> APIRouter:
    router = APIRouter(prefix="/api")
    product_health_runner = product_health_execution_service or ProductHealthManualRunExecutionService(
        output_root=week2_workflow_service.output_root,
    )

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
        target_payload = target_dataset.model_dump(mode="json")
        if product_health_manual_run_contract_service.applies_to(target_payload):
            execution_result = product_health_runner.run(
                target_dataset=target_payload,
                source_snapshots=[snapshot.model_dump(mode="json", by_alias=True) for snapshot in run_request.source_snapshots],
                executor=run_request.executor,
                triggered_by=run_request.triggered_by,
            )
        else:
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

        handoff_result = execution_result_with_target_handoff(
            execution_result,
            target_payload,
            product_health_manual_run_contract=execution_result.get("product_health_manual_run_contract"),
        )
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
    product_health_manual_run_contract: dict[str, Any] | None = None,
) -> dict[str, Any]:
    next_result = dict(execution_result)
    outputs = next_result.get("outputs") or []
    runtime_output = outputs[0] if outputs else {}
    job_definition = target_dataset["job_definition"]
    is_product_health_run = product_health_manual_run_contract_service.applies_to(target_dataset)
    runtime_output_scope = "week2_fixture_output"
    if is_product_health_run:
        runtime_output_scope = (
            (product_health_manual_run_contract or {}).get("lineage", {}).get("runtime_output_scope")
            or "product_health_gold_output_failed"
        )
    next_result["target_dataset_handoff"] = {
        "target_dataset_id": target_dataset["id"],
        "target_dataset_name": target_dataset["name"],
        "job_definition_status": job_definition["status"],
        "source_dataset_id": target_dataset["source_dataset_id"],
        "source_mappings": target_dataset.get("source_mappings", []),
        "selected_fields": target_dataset["selected_fields"],
        "process_rule": target_dataset["process_rule"],
        "schedule": target_dataset["schedule"],
        "output_schema": target_dataset["output_schema"],
        "runtime_output_scope": runtime_output_scope,
        "runtime_output_dataset_id": runtime_output.get("dataset_id"),
        "runtime_pipeline_id": next_result.get("pipeline_id"),
    }
    if is_product_health_run:
        next_result["product_health_manual_run_contract"] = (
            product_health_manual_run_contract
            or product_health_manual_run_contract_service.build_contract(
                execution_result=next_result,
                target_dataset=target_dataset,
            )
        )
    return next_result
