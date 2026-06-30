from typing import Protocol

from app.domain.schemas import (
    CatalogDataset,
    ColumnSchema,
    DashboardCardCreate,
    DashboardCardRecord,
    ExternalConnectionCreate,
    ExternalConnectionRecord,
    PipelineCreate,
    PipelineRecord,
    PipelineRunRecord,
    SourceCreate,
    SourceDatasetCreate,
    SourceDatasetRecord,
    SourceRecord,
    TargetDatasetCreate,
    TargetDatasetRecord,
    TargetDatasetRunRecord,
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

    def create_source_dataset(self, dataset: SourceDatasetCreate) -> SourceDatasetRecord: ...

    def list_source_datasets(self) -> list[SourceDatasetRecord]: ...

    def get_source_dataset(self, dataset_id: str) -> SourceDatasetRecord | None: ...

    def delete_source_dataset(self, dataset_id: str) -> bool: ...

    def create_target_dataset(self, dataset: TargetDatasetCreate) -> TargetDatasetRecord: ...

    def list_target_datasets(self) -> list[TargetDatasetRecord]: ...

    def get_target_dataset(self, dataset_id: str) -> TargetDatasetRecord | None: ...

    def create_target_dataset_run(
        self,
        target_dataset: TargetDatasetRecord,
        execution_result: dict[str, object],
    ) -> TargetDatasetRunRecord: ...

    def list_target_dataset_runs(self, target_dataset_id: str) -> list[TargetDatasetRunRecord]: ...

    def get_target_dataset_run(self, run_record_id: str) -> TargetDatasetRunRecord | None: ...

    def list_catalog_datasets(self) -> list[CatalogDataset]: ...

    def get_catalog_dataset(self, dataset_id: str) -> CatalogDataset | None: ...

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

    def create_dashboard_card(self, card: DashboardCardCreate) -> DashboardCardRecord: ...

    def list_dashboard_cards(self) -> list[DashboardCardRecord]: ...

    def get_dashboard_card(self, dashboard_card_id: str) -> DashboardCardRecord | None: ...
