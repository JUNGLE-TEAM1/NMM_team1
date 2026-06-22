import sqlite3

from app.domain.schemas import CatalogDataset, PipelineCreate, PipelineRecord, PipelineRunRecord
from app.domain.transforms import apply_select_fields, find_missing_fields
from app.ports.metadata_store import MetadataStore
from app.ports.result_store import ResultStore
from app.ports.source_connector import SourceConnector


class PipelineValidationError(ValueError):
    pass


class PipelineService:
    def __init__(
        self,
        store: MetadataStore,
        source_connectors: list[SourceConnector],
        result_store: ResultStore,
    ) -> None:
        self.store = store
        self.source_connectors = {connector.source_type: connector for connector in source_connectors}
        self.result_store = result_store

    def create_pipeline(self, pipeline: PipelineCreate) -> PipelineRecord:
        source_dataset = self.store.get_catalog_dataset(pipeline.source_dataset_id)
        if source_dataset is None:
            raise PipelineValidationError("Source dataset not found")

        missing_fields = find_missing_fields(source_dataset.columns, pipeline.select_fields)
        if missing_fields:
            raise PipelineValidationError(f"Unknown select fields: {', '.join(missing_fields)}")

        try:
            return self.store.create_pipeline(pipeline)
        except sqlite3.IntegrityError as error:
            raise PipelineValidationError(f"Pipeline name already exists: {pipeline.name}") from error

    def run_pipeline(self, pipeline_id: str) -> PipelineRunRecord:
        pipeline = self.store.get_pipeline(pipeline_id)
        if pipeline is None:
            raise PipelineValidationError("Pipeline not found")

        run = self.store.create_pipeline_run(pipeline.id)
        logs = ["queued", "running"]
        self.store.update_pipeline_run(run.id, "running", logs=logs)

        try:
            source_dataset = self._get_source_dataset(pipeline)
            connector = self._get_connector(source_dataset)
            source_schema, source_rows = connector.read_rows(source_dataset)
            result_schema, result_rows = apply_select_fields(source_schema, source_rows, pipeline.select_fields)
            result_dataset_id = f"run-{run.id}"
            result_location = self.result_store.write_rows(result_dataset_id, result_rows)
            sample = result_rows[:5]
            result_dataset = self.store.create_result_dataset(
                name=pipeline.target_name,
                source_id=source_dataset.source_id,
                source_type="pipeline_result",
                path=result_location,
                schema=result_schema,
                row_count=len(result_rows),
                sample=sample,
            )
            logs.append(f"wrote {len(result_rows)} rows to {result_location}")
            logs.append("success")
            return self.store.update_pipeline_run(
                run.id,
                "success",
                result_dataset_id=result_dataset.id,
                result_location=result_location,
                row_count=len(result_rows),
                logs=logs,
            )
        except Exception as error:
            logs.append(str(error))
            logs.append("failed")
            return self.store.update_pipeline_run(run.id, "failed", error_message=str(error), logs=logs)

    def _get_source_dataset(self, pipeline: PipelineRecord) -> CatalogDataset:
        source_dataset = self.store.get_catalog_dataset(pipeline.source_dataset_id)
        if source_dataset is None:
            raise PipelineValidationError("Source dataset not found")
        return source_dataset

    def _get_connector(self, dataset: CatalogDataset) -> SourceConnector:
        connector = self.source_connectors.get(dataset.source_type)
        if connector is None:
            raise PipelineValidationError(f"Unsupported source type: {dataset.source_type}")
        return connector
