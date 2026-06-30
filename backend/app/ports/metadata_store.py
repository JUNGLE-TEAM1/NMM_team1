from typing import Protocol

from app.domain.schemas import (
    CatalogDataset,
    ColumnSchema,
    ExternalConnectionCreate,
    ExternalConnectionRecord,
    ExternalConnectionUpdate,
    PipelineCreate,
    PipelineRecord,
    PipelineRunRecord,
    SilverDatasetCreate,
    SilverDatasetMaterializationRecord,
    SilverDatasetRecord,
    SilverDatasetUpdate,
    SourceCreate,
    SourceDatasetCreate,
    SourceDatasetRecord,
    SourceDatasetSnapshotRecord,
    SourceDatasetUpdate,
    SourceRecord,
    TargetDatasetDraftCreate,
    TargetDatasetDraftRecord,
    TargetDatasetDraftUpdate,
    TargetDatasetJobRunCreate,
    TargetDatasetJobRunRecord,
    TargetDatasetSchedule,
)


class MetadataStore(Protocol):
    def initialize(self) -> None: ...

    def create_source_with_dataset(
        self,
        source: SourceCreate,
        schema: list[ColumnSchema],
        row_count: int,
        sample: list[dict[str, object]],
    ) -> tuple[SourceRecord, CatalogDataset]: ...

    def list_sources(self) -> list[SourceRecord]: ...

    def get_source(self, source_id: str) -> SourceRecord | None: ...

    def create_external_connection(self, connection: ExternalConnectionCreate) -> ExternalConnectionRecord: ...

    def list_external_connections(self) -> list[ExternalConnectionRecord]: ...

    def get_external_connection(self, connection_id: str) -> ExternalConnectionRecord | None: ...

    def update_external_connection(
        self,
        connection_id: str,
        connection: ExternalConnectionUpdate,
    ) -> ExternalConnectionRecord | None: ...

    def delete_external_connection(self, connection_id: str) -> bool: ...

    def create_source_dataset(self, dataset: SourceDatasetCreate) -> SourceDatasetRecord: ...

    def list_source_datasets(self) -> list[SourceDatasetRecord]: ...

    def get_source_dataset(self, dataset_id: str) -> SourceDatasetRecord | None: ...

    def update_source_dataset(self, dataset_id: str, dataset: SourceDatasetUpdate) -> SourceDatasetRecord | None: ...

    def delete_source_dataset(self, dataset_id: str) -> bool: ...

    def create_source_dataset_snapshot(self, snapshot: SourceDatasetSnapshotRecord) -> SourceDatasetSnapshotRecord: ...

    def list_source_dataset_snapshots(self, dataset_id: str) -> list[SourceDatasetSnapshotRecord]: ...

    def create_silver_dataset(self, dataset: SilverDatasetCreate) -> SilverDatasetRecord: ...

    def list_silver_datasets(self) -> list[SilverDatasetRecord]: ...

    def get_silver_dataset(self, dataset_id: str) -> SilverDatasetRecord | None: ...

    def update_silver_dataset_schedule(
        self,
        dataset_id: str,
        schedule: TargetDatasetSchedule,
    ) -> SilverDatasetRecord | None: ...

    def update_silver_dataset(self, dataset_id: str, dataset: SilverDatasetUpdate) -> SilverDatasetRecord | None: ...

    def delete_silver_dataset(self, dataset_id: str) -> bool: ...

    def create_silver_dataset_materialization(
        self,
        materialization: SilverDatasetMaterializationRecord,
    ) -> SilverDatasetMaterializationRecord: ...

    def list_silver_dataset_materializations(self, dataset_id: str) -> list[SilverDatasetMaterializationRecord]: ...

    def create_target_dataset_draft(self, draft: TargetDatasetDraftCreate) -> TargetDatasetDraftRecord: ...

    def list_target_dataset_drafts(self) -> list[TargetDatasetDraftRecord]: ...

    def get_target_dataset_draft(self, draft_id: str) -> TargetDatasetDraftRecord | None: ...

    def update_target_dataset_draft_schedule(
        self,
        draft_id: str,
        schedule: TargetDatasetSchedule,
    ) -> TargetDatasetDraftRecord | None: ...

    def update_target_dataset_draft(
        self,
        draft_id: str,
        draft: TargetDatasetDraftUpdate,
    ) -> TargetDatasetDraftRecord | None: ...

    def delete_target_dataset_draft(self, draft_id: str) -> bool: ...

    def create_target_dataset_job_run(
        self,
        draft: TargetDatasetDraftRecord,
        run: TargetDatasetJobRunCreate,
    ) -> TargetDatasetJobRunRecord: ...

    def list_target_dataset_job_runs(self) -> list[TargetDatasetJobRunRecord]: ...

    def get_target_dataset_job_run(self, run_id: str) -> TargetDatasetJobRunRecord | None: ...

    def update_target_dataset_job_run_materialization(
        self,
        run_id: str,
        status: str,
        run_note: str,
        output_path: str | None,
        row_count: int | None,
        output_bytes: int | None,
        silver_output_paths: list[str],
        logs: list[str],
        duration_ms: int | None = None,
        source_evidence: list[dict[str, object]] | None = None,
        runtime_evidence: dict[str, object] | None = None,
    ) -> TargetDatasetJobRunRecord: ...

    def list_catalog_datasets(self) -> list[CatalogDataset]: ...

    def get_catalog_dataset(self, dataset_id: str) -> CatalogDataset | None: ...

    def get_catalog_dataset_by_source_id(self, source_id: str) -> CatalogDataset | None: ...

    def publish_target_dataset_job_run_to_catalog(
        self,
        run: TargetDatasetJobRunRecord,
        draft: TargetDatasetDraftRecord,
    ) -> CatalogDataset: ...

    def update_catalog_dataset_trust(
        self,
        dataset_id: str,
        owner: str,
        trust_status: str,
        trust_gate_result: dict[str, object],
    ) -> CatalogDataset | None: ...

    def create_pipeline(self, pipeline: PipelineCreate) -> PipelineRecord: ...

    def list_pipelines(self) -> list[PipelineRecord]: ...

    def get_pipeline(self, pipeline_id: str) -> PipelineRecord | None: ...

    def create_pipeline_run(self, pipeline_id: str) -> PipelineRunRecord: ...

    def update_pipeline_run(
        self,
        run_id: str,
        status: str,
        result_dataset_id: str | None = None,
        result_location: str | None = None,
        row_count: int | None = None,
        error_message: str | None = None,
        logs: list[str] | None = None,
    ) -> PipelineRunRecord: ...

    def get_pipeline_run(self, run_id: str) -> PipelineRunRecord | None: ...

    def create_result_dataset(
        self,
        name: str,
        source_id: str,
        source_type: str,
        path: str,
        schema: list[ColumnSchema],
        row_count: int,
        sample: list[dict[str, object]],
    ) -> CatalogDataset: ...
