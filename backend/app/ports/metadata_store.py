from typing import Protocol

from app.domain.schemas import (
    CatalogDataset,
    ColumnSchema,
    PipelineCreate,
    PipelineRecord,
    PipelineRunRecord,
    SourceCreate,
    SourceDatasetCreate,
    SourceDatasetRecord,
    SourceRecord,
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

    def create_source_dataset(self, dataset: SourceDatasetCreate) -> SourceDatasetRecord: ...

    def list_source_datasets(self) -> list[SourceDatasetRecord]: ...

    def get_source_dataset(self, dataset_id: str) -> SourceDatasetRecord | None: ...

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
