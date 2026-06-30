import sqlite3

from fastapi import APIRouter, HTTPException, status

from app.adapters.csv_source import CsvInspectionError
from app.domain.schemas import (
    CatalogDataset,
    ExternalConnectionCreate,
    ExternalConnectionInspectRequest,
    ExternalConnectionInspectResult,
    ExternalConnectionRecord,
    ExternalConnectionTestRequest,
    ExternalConnectionTestResult,
    ExternalConnectionUpdate,
    SourceCreate,
    SilverDatasetCreate,
    SilverDatasetMaterializationCreate,
    SilverDatasetMaterializationRecord,
    SilverDatasetRecord,
    SilverDatasetUpdate,
    SourceDatasetCreate,
    SourceDatasetRecord,
    SourceDatasetSnapshotCreate,
    SourceDatasetSnapshotRecord,
    SourceDatasetUpdate,
    SourceRecord,
    SourceRegistration,
    TargetDatasetDraftCreate,
    TargetDatasetDraftRecord,
    TargetDatasetDraftUpdate,
    TargetDatasetJobRunCreate,
    TargetDatasetJobRunRecord,
    TargetDatasetSchedule,
    TrustGateEvaluationRequest,
)
from app.domain.target_contracts import TrustGateResult
from app.ports.metadata_store import MetadataStore
from app.services.catalog_trust import CatalogTrustService
from app.services.dataset_file_evidence import gold_file_evidence, silver_file_evidence, source_file_evidence
from app.services.external_connection_discovery import ExternalConnectionDiscoveryError, ExternalConnectionDiscoveryService
from app.services.external_connection_runtime import (
    ExternalConnectionRuntimeCheckError,
    ExternalConnectionRuntimeCheckService,
)
from app.services.source_catalog import SourceCatalogService
from app.services.source_dataset_snapshot import SourceDatasetSnapshotError, SourceDatasetSnapshotService
from app.services.silver_dataset_materialization import (
    SilverDatasetMaterializationError,
    SilverDatasetMaterializationService,
)
from app.services.target_dataset_local_runner import TargetDatasetLocalRunner, TargetDatasetLocalRunnerError


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

    @router.post("/external-connections", response_model=ExternalConnectionRecord, status_code=status.HTTP_201_CREATED)
    def create_external_connection(connection: ExternalConnectionCreate) -> ExternalConnectionRecord:
        try:
            return metadata_store.create_external_connection(connection)
        except sqlite3.IntegrityError as error:
            raise HTTPException(status_code=409, detail=f"External connection name already exists: {connection.name}") from error

    @router.get("/external-connections", response_model=list[ExternalConnectionRecord])
    def list_external_connections() -> list[ExternalConnectionRecord]:
        return metadata_store.list_external_connections()

    @router.post("/external-connections/inspect", response_model=ExternalConnectionInspectResult)
    def inspect_external_connection(connection: ExternalConnectionInspectRequest) -> ExternalConnectionInspectResult:
        try:
            return ExternalConnectionDiscoveryService().inspect(connection)
        except ExternalConnectionDiscoveryError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error

    @router.post("/external-connections/test", response_model=ExternalConnectionTestResult)
    def test_external_connection(connection: ExternalConnectionTestRequest) -> ExternalConnectionTestResult:
        try:
            return ExternalConnectionRuntimeCheckService().test(connection)
        except ExternalConnectionRuntimeCheckError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error

    @router.get("/external-connections/credential-policy")
    def get_external_connection_credential_policy() -> dict[str, object]:
        return {
            "status": "secret_ref_design_only",
            "allowed_connector_types": ["database", "object_storage"],
            "credential_storage": "secret_ref_only",
            "secret_value_storage": "forbidden",
            "inspect_requires_secret_ref": True,
            "connection_test_enabled": True,
            "blocked_until": [
                "secret storage backend is selected",
                "credential rotation and revoke behavior is defined",
                "schema discovery is implemented per connector",
                "runtime test results are persisted as audit evidence",
            ],
            "required_references": {
                "postgres": ["username_ref", "password_ref"],
                "mongodb": ["username_ref", "password_ref"],
                "s3": ["access_key_ref", "secret_key_ref"],
                "kafka": [],
            },
            "forbidden_request_fields": ["password", "access_key", "secret_key", "token", "raw_credential"],
            "response_redaction": "return configured/missing booleans and reference names only",
            "local_env_policy": "local development may use env var names as secret_ref values; env values must not be committed or echoed",
        }

    @router.get("/external-connections/{connection_id}", response_model=ExternalConnectionRecord)
    def get_external_connection(connection_id: str) -> ExternalConnectionRecord:
        connection = metadata_store.get_external_connection(connection_id)
        if connection is None:
            raise HTTPException(status_code=404, detail="External connection not found")
        return connection

    @router.patch("/external-connections/{connection_id}", response_model=ExternalConnectionRecord)
    def update_external_connection(connection_id: str, connection: ExternalConnectionUpdate) -> ExternalConnectionRecord:
        try:
            updated_connection = metadata_store.update_external_connection(connection_id, connection)
        except sqlite3.IntegrityError as error:
            requested_name = connection.name or connection_id
            raise HTTPException(status_code=409, detail=f"External connection name already exists: {requested_name}") from error
        if updated_connection is None:
            raise HTTPException(status_code=404, detail="External connection not found")
        return updated_connection

    @router.delete("/external-connections/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_external_connection(connection_id: str) -> None:
        try:
            deleted = metadata_store.delete_external_connection(connection_id)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        if not deleted:
            raise HTTPException(status_code=404, detail="External connection not found")
        return None

    @router.post("/source-datasets", response_model=SourceDatasetRecord, status_code=status.HTTP_201_CREATED)
    def create_source_dataset(dataset: SourceDatasetCreate) -> SourceDatasetRecord:
        try:
            return with_source_file_evidence(metadata_store.create_source_dataset(dataset))
        except sqlite3.IntegrityError as error:
            raise HTTPException(status_code=409, detail=f"Source dataset name already exists: {dataset.name}") from error

    @router.get("/source-datasets", response_model=list[SourceDatasetRecord])
    def list_source_datasets() -> list[SourceDatasetRecord]:
        return [with_source_file_evidence(dataset) for dataset in metadata_store.list_source_datasets()]

    @router.get("/source-datasets/{dataset_id}", response_model=SourceDatasetRecord)
    def get_source_dataset(dataset_id: str) -> SourceDatasetRecord:
        dataset = metadata_store.get_source_dataset(dataset_id)
        if dataset is None:
            raise HTTPException(status_code=404, detail="Source dataset not found")
        return with_source_file_evidence(dataset)

    @router.patch("/source-datasets/{dataset_id}", response_model=SourceDatasetRecord)
    def update_source_dataset(dataset_id: str, dataset: SourceDatasetUpdate) -> SourceDatasetRecord:
        try:
            updated_dataset = metadata_store.update_source_dataset(dataset_id, dataset)
        except sqlite3.IntegrityError as error:
            requested_name = dataset.name or dataset_id
            raise HTTPException(status_code=409, detail=f"Source dataset name already exists: {requested_name}") from error
        if updated_dataset is None:
            raise HTTPException(status_code=404, detail="Source dataset not found")
        return with_source_file_evidence(updated_dataset)

    @router.delete("/source-datasets/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_source_dataset(dataset_id: str) -> None:
        try:
            deleted = metadata_store.delete_source_dataset(dataset_id)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        if not deleted:
            raise HTTPException(status_code=404, detail="Source dataset not found")
        return None

    @router.post("/source-datasets/{dataset_id}/snapshots", response_model=SourceDatasetSnapshotRecord, status_code=status.HTTP_201_CREATED)
    def create_source_dataset_snapshot(
        dataset_id: str,
        request: SourceDatasetSnapshotCreate,
    ) -> SourceDatasetSnapshotRecord:
        dataset = metadata_store.get_source_dataset(dataset_id)
        if dataset is None:
            raise HTTPException(status_code=404, detail="Source dataset not found")
        connection = metadata_store.get_external_connection(dataset.connection_id)
        try:
            snapshot = SourceDatasetSnapshotService().create_snapshot(dataset, connection, request)
        except (SourceDatasetSnapshotError, ExternalConnectionDiscoveryError) as error:
            raise HTTPException(status_code=400, detail=str(error)) from error
        metadata_store.update_source_dataset(dataset_id, SourceDatasetUpdate(status="snapshot_ready"))
        return metadata_store.create_source_dataset_snapshot(snapshot)

    @router.get("/source-datasets/{dataset_id}/snapshots", response_model=list[SourceDatasetSnapshotRecord])
    def list_source_dataset_snapshots(dataset_id: str) -> list[SourceDatasetSnapshotRecord]:
        if metadata_store.get_source_dataset(dataset_id) is None:
            raise HTTPException(status_code=404, detail="Source dataset not found")
        return metadata_store.list_source_dataset_snapshots(dataset_id)

    @router.post("/silver-datasets", response_model=SilverDatasetRecord, status_code=status.HTTP_201_CREATED)
    def create_silver_dataset(dataset: SilverDatasetCreate) -> SilverDatasetRecord:
        source_dataset = metadata_store.get_source_dataset(dataset.source_dataset_id)
        if source_dataset is None:
            raise HTTPException(status_code=404, detail="Source dataset not found")
        try:
            return with_silver_file_evidence(metadata_store.create_silver_dataset(dataset))
        except sqlite3.IntegrityError as error:
            raise HTTPException(status_code=409, detail=f"Silver dataset name already exists: {dataset.name}") from error

    @router.get("/silver-datasets", response_model=list[SilverDatasetRecord])
    def list_silver_datasets() -> list[SilverDatasetRecord]:
        return [with_silver_file_evidence(dataset) for dataset in metadata_store.list_silver_datasets()]

    @router.get("/silver-datasets/{dataset_id}", response_model=SilverDatasetRecord)
    def get_silver_dataset(dataset_id: str) -> SilverDatasetRecord:
        dataset = metadata_store.get_silver_dataset(dataset_id)
        if dataset is None:
            raise HTTPException(status_code=404, detail="Silver dataset not found")
        return with_silver_file_evidence(dataset)

    @router.patch("/silver-datasets/{dataset_id}", response_model=SilverDatasetRecord)
    def update_silver_dataset(dataset_id: str, dataset: SilverDatasetUpdate) -> SilverDatasetRecord:
        try:
            updated_dataset = metadata_store.update_silver_dataset(dataset_id, dataset)
        except sqlite3.IntegrityError as error:
            requested_name = dataset.name or dataset_id
            raise HTTPException(status_code=409, detail=f"Silver dataset name already exists: {requested_name}") from error
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        if updated_dataset is None:
            raise HTTPException(status_code=404, detail="Silver dataset not found")
        return with_silver_file_evidence(updated_dataset)

    @router.patch("/silver-datasets/{dataset_id}/schedule", response_model=SilverDatasetRecord)
    def update_silver_dataset_schedule(dataset_id: str, schedule: TargetDatasetSchedule) -> SilverDatasetRecord:
        dataset = metadata_store.update_silver_dataset_schedule(dataset_id, schedule)
        if dataset is None:
            raise HTTPException(status_code=404, detail="Silver dataset not found")
        return with_silver_file_evidence(dataset)

    @router.delete("/silver-datasets/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_silver_dataset(dataset_id: str) -> None:
        try:
            deleted = metadata_store.delete_silver_dataset(dataset_id)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        if not deleted:
            raise HTTPException(status_code=404, detail="Silver dataset not found")
        return None

    @router.post(
        "/silver-datasets/{dataset_id}/materializations",
        response_model=SilverDatasetMaterializationRecord,
        status_code=status.HTTP_201_CREATED,
    )
    def create_silver_dataset_materialization(
        dataset_id: str,
        request: SilverDatasetMaterializationCreate,
    ) -> SilverDatasetMaterializationRecord:
        silver = metadata_store.get_silver_dataset(dataset_id)
        if silver is None:
            raise HTTPException(status_code=404, detail="Silver dataset not found")
        source = metadata_store.get_source_dataset(silver.source_dataset_id)
        if source is None:
            raise HTTPException(status_code=404, detail="Source dataset not found")
        latest_snapshot = next(iter(metadata_store.list_source_dataset_snapshots(source.id)), None)
        try:
            materialization = SilverDatasetMaterializationService().materialize(
                silver=silver,
                source=source,
                latest_snapshot=latest_snapshot,
                request=request,
            )
        except SilverDatasetMaterializationError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error
        metadata_store.update_silver_dataset(dataset_id, SilverDatasetUpdate(status="materialized"))
        return metadata_store.create_silver_dataset_materialization(materialization)

    @router.get("/silver-datasets/{dataset_id}/materializations", response_model=list[SilverDatasetMaterializationRecord])
    def list_silver_dataset_materializations(dataset_id: str) -> list[SilverDatasetMaterializationRecord]:
        if metadata_store.get_silver_dataset(dataset_id) is None:
            raise HTTPException(status_code=404, detail="Silver dataset not found")
        return metadata_store.list_silver_dataset_materializations(dataset_id)

    @router.post("/target-dataset-drafts", response_model=TargetDatasetDraftRecord, status_code=status.HTTP_201_CREATED)
    def create_target_dataset_draft(draft: TargetDatasetDraftCreate) -> TargetDatasetDraftRecord:
        try:
            return with_gold_file_evidence(metadata_store.create_target_dataset_draft(draft))
        except sqlite3.IntegrityError as error:
            raise HTTPException(
                status_code=409,
                detail=f"Target dataset draft name already exists: {draft.target_dataset_name}",
            ) from error

    @router.get("/target-dataset-drafts", response_model=list[TargetDatasetDraftRecord])
    def list_target_dataset_drafts() -> list[TargetDatasetDraftRecord]:
        return [with_gold_file_evidence(draft) for draft in metadata_store.list_target_dataset_drafts()]

    @router.get("/target-dataset-drafts/{draft_id}", response_model=TargetDatasetDraftRecord)
    def get_target_dataset_draft(draft_id: str) -> TargetDatasetDraftRecord:
        draft = metadata_store.get_target_dataset_draft(draft_id)
        if draft is None:
            raise HTTPException(status_code=404, detail="Target dataset draft not found")
        return with_gold_file_evidence(draft)

    @router.patch("/target-dataset-drafts/{draft_id}", response_model=TargetDatasetDraftRecord)
    def update_target_dataset_draft(draft_id: str, draft: TargetDatasetDraftUpdate) -> TargetDatasetDraftRecord:
        try:
            updated_draft = metadata_store.update_target_dataset_draft(draft_id, draft)
        except sqlite3.IntegrityError as error:
            requested_name = draft.target_dataset_name or draft_id
            raise HTTPException(status_code=409, detail=f"Target dataset draft name already exists: {requested_name}") from error
        if updated_draft is None:
            raise HTTPException(status_code=404, detail="Target dataset draft not found")
        return with_gold_file_evidence(updated_draft)

    @router.patch("/target-dataset-drafts/{draft_id}/schedule", response_model=TargetDatasetDraftRecord)
    def update_target_dataset_draft_schedule(draft_id: str, schedule: TargetDatasetSchedule) -> TargetDatasetDraftRecord:
        draft = metadata_store.update_target_dataset_draft_schedule(draft_id, schedule)
        if draft is None:
            raise HTTPException(status_code=404, detail="Target dataset draft not found")
        return with_gold_file_evidence(draft)

    @router.delete("/target-dataset-drafts/{draft_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_target_dataset_draft(draft_id: str) -> None:
        try:
            deleted = metadata_store.delete_target_dataset_draft(draft_id)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        if not deleted:
            raise HTTPException(status_code=404, detail="Target dataset draft not found")
        return None

    @router.post("/target-dataset-job-runs", response_model=TargetDatasetJobRunRecord, status_code=status.HTTP_201_CREATED)
    def create_target_dataset_job_run(run: TargetDatasetJobRunCreate) -> TargetDatasetJobRunRecord:
        draft = metadata_store.get_target_dataset_draft(run.target_dataset_draft_id)
        if draft is None:
            raise HTTPException(status_code=404, detail="Target dataset draft not found")
        return metadata_store.create_target_dataset_job_run(draft, run)

    @router.get("/target-dataset-job-runs", response_model=list[TargetDatasetJobRunRecord])
    def list_target_dataset_job_runs() -> list[TargetDatasetJobRunRecord]:
        return metadata_store.list_target_dataset_job_runs()

    @router.get("/target-dataset-job-runs/{run_id}", response_model=TargetDatasetJobRunRecord)
    def get_target_dataset_job_run(run_id: str) -> TargetDatasetJobRunRecord:
        run = metadata_store.get_target_dataset_job_run(run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Target dataset job run not found")
        return run

    @router.post("/target-dataset-job-runs/{run_id}/execute", response_model=TargetDatasetJobRunRecord)
    def execute_target_dataset_job_run(run_id: str) -> TargetDatasetJobRunRecord:
        run = metadata_store.get_target_dataset_job_run(run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Target dataset job run not found")
        draft = metadata_store.get_target_dataset_draft(run.target_dataset_draft_id)
        if draft is None:
            raise HTTPException(status_code=404, detail="Target dataset draft not found")
        try:
            result = TargetDatasetLocalRunner().run(run, draft)
        except TargetDatasetLocalRunnerError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error
        return metadata_store.update_target_dataset_job_run_materialization(
            run_id=run.id,
            status="succeeded",
            run_note=run_note_for_materialization(result.runtime_evidence),
            output_path=result.output_path,
            row_count=result.row_count,
            output_bytes=result.output_bytes,
            silver_output_paths=result.silver_output_paths,
            logs=result.logs,
            duration_ms=result.duration_ms,
            source_evidence=result.source_evidence,
            runtime_evidence=result.runtime_evidence,
        )

    @router.post(
        "/target-dataset-job-runs/{run_id}/publish-catalog",
        response_model=CatalogDataset,
        status_code=status.HTTP_201_CREATED,
    )
    def publish_target_dataset_job_run_to_catalog(run_id: str) -> CatalogDataset:
        run = metadata_store.get_target_dataset_job_run(run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Target dataset job run not found")
        draft = metadata_store.get_target_dataset_draft(run.target_dataset_draft_id)
        if draft is None:
            raise HTTPException(status_code=404, detail="Target dataset draft not found")
        try:
            return metadata_store.publish_target_dataset_job_run_to_catalog(run, draft)
        except ValueError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error

    @router.get("/catalog/datasets", response_model=list[CatalogDataset])
    def list_catalog_datasets() -> list[CatalogDataset]:
        return metadata_store.list_catalog_datasets()

    @router.get("/catalog/datasets/management-policy")
    def get_catalog_dataset_management_policy() -> dict[str, object]:
        return {
            "status": "read_only_boundary",
            "allowed_actions": ["detail", "ai_query_context"],
            "disabled_actions": ["metadata_update", "metadata_delete", "file_delete", "cascade_delete"],
            "metadata_delete_policy": "deferred",
            "file_delete_policy": "never_without_explicit_human_confirmation",
            "cascade_delete_policy": "blocked_until_reference_policy_exists",
            "reference_blocking": [
                "AI Query readiness and selected catalog context must not break silently.",
                "Target Dataset Job Run lineage must remain auditable after publish.",
                "Prepared/local output files are evidence and are not deleted by metadata management.",
            ],
            "next_phase_scope": [
                "Add metadata-only delete only after 409 reference checks are defined.",
                "Keep output file delete as a separate explicit-confirmation flow.",
                "Keep cascade delete out of MVP unless a rollback plan exists.",
            ],
        }

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


def with_source_file_evidence(dataset: SourceDatasetRecord) -> SourceDatasetRecord:
    return dataset.model_copy(update={"file_evidence": source_file_evidence(dataset.raw_scope)})


def with_silver_file_evidence(dataset: SilverDatasetRecord) -> SilverDatasetRecord:
    return dataset.model_copy(update={"file_evidence": silver_file_evidence(dataset.name)})


def with_gold_file_evidence(draft: TargetDatasetDraftRecord) -> TargetDatasetDraftRecord:
    return draft.model_copy(update={"file_evidence": gold_file_evidence(draft.gold_output)})


def run_note_for_materialization(runtime_evidence: dict[str, object]) -> str:
    if runtime_evidence.get("materialization_mode") == "prepared_gold_reference":
        return "Prepared Product Health Gold parquet referenced in C-17."
    if runtime_evidence.get("materialization_mode") == "silver_parquet_to_gold":
        return "Silver parquet inputs materialized into Gold parquet in C-28."
    return "Local runner materialized planned Silver/Gold outputs in C-4.5."
