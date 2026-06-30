from typing import Any, Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, model_validator


class ColumnSchema(BaseModel):
    name: str
    type: str


class SourceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    type: Literal["csv"]
    path: str = Field(min_length=1, max_length=500)


class SourceRecord(BaseModel):
    id: str
    name: str
    type: str
    path: str
    status: str
    dataset_id: str | None = None
    error_message: str | None = None
    created_at: str


class CatalogDataset(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    source_id: str
    source_type: str
    path: str
    columns: list[ColumnSchema] = Field(alias="schema")
    row_count: int
    sample: list[dict[str, object]]
    status: str
    owner: str = "unassigned"
    trust_status: str = "Draft"
    trust_gate_result: dict[str, object] | None = None
    error_message: str | None = None
    created_at: str


class SourceRegistration(BaseModel):
    source: SourceRecord
    dataset: CatalogDataset


class SourceDatasetCreate(BaseModel):
    connection_id: str = Field(min_length=1, max_length=120)
    connection_name: str = Field(min_length=1, max_length=120)
    connection_type: Literal["csv", "kafka", "postgres", "mongodb", "api", "s3"]
    name: str = Field(min_length=1, max_length=120)
    raw_scope: str = Field(min_length=1, max_length=500)
    resource_label: str = Field(min_length=1, max_length=80)
    schema_preview: list[ColumnSchema] = Field(min_length=1)


class SourceDatasetRecord(BaseModel):
    id: str
    connection_id: str
    connection_name: str
    connection_type: str
    name: str
    raw_scope: str
    resource_label: str
    schema_preview: list[ColumnSchema]
    layer: Literal["source"] = "source"
    status: str
    created_at: str
    updated_at: str


class ExternalConnectionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    connection_type: Literal["csv", "kafka", "postgres", "mongodb", "api", "s3"]
    host: str = Field(default="local", min_length=1, max_length=255)
    port: int = Field(default=1, ge=1, le=65535)
    database: str = Field(default="metadata", min_length=1, max_length=500)
    username: str = Field(default="none", min_length=1, max_length=120)
    password_secret_ref: str = Field(default="none", min_length=1, max_length=120)
    default_schema: str = Field(default="public", min_length=1, max_length=120)
    default_table: str = Field(min_length=1, max_length=500)


class ExternalConnectionRecord(BaseModel):
    id: str
    name: str
    connection_type: str
    host: str
    port: int
    database: str
    username: str
    password_secret_ref: str
    default_schema: str
    default_table: str
    status: str
    created_at: str
    updated_at: str


class ExternalTableSchema(BaseModel):
    connection_id: str
    schema_name: str
    table_name: str
    raw_scope: str
    resource_label: Literal["schema_table", "topic", "file_path", "collection", "endpoint", "bucket_prefix"] = "schema_table"
    schema_preview: list[ColumnSchema]
    row_count_estimate: int | None = None


class ProcessingTemplateRecord(BaseModel):
    id: str
    label: str
    description: str
    mode: Literal["recommended_template"]
    template_version: str
    target_dataset: str
    query_table: str
    flow: list[str]
    source_contracts: dict[str, str]
    source_requirements: list[dict[str, Any]]
    steps: list[dict[str, Any]]
    quality_rules: list[dict[str, Any]]
    output_schema: list[dict[str, Any]]
    metric_definitions: list[dict[str, Any]]
    locked_fields: list[str]
    contract_claims: dict[str, Any]


class TargetSourceMapping(BaseModel):
    role: Literal["reviews", "behavior", "delivery", "product_master"]
    source_id: str = Field(min_length=1, max_length=120)
    source_dataset_id: str = Field(min_length=1, max_length=120)
    source_dataset_name: str = Field(min_length=1, max_length=120)
    source_type: str = Field(min_length=1, max_length=80)
    required_fields: list[str] = Field(default_factory=list)
    optional_fields: list[str] = Field(default_factory=list)
    produces_metrics: list[str] = Field(default_factory=list)


class TargetDatasetCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=500)
    source_dataset_id: str = Field(min_length=1, max_length=120)
    source_dataset_name: str = Field(min_length=1, max_length=120)
    source_type: str = Field(min_length=1, max_length=80)
    source_mappings: list[TargetSourceMapping] = Field(default_factory=list)
    selected_fields: list[str] = Field(min_length=1)
    process_rule: dict[str, Any]
    schedule: dict[str, Any]
    output_schema: list[ColumnSchema] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_source_mapping_roles(self) -> "TargetDatasetCreate":
        roles = [mapping.role for mapping in self.source_mappings]
        if len(roles) != len(set(roles)):
            raise ValueError("source_mappings roles must be unique")
        return self


class TargetDatasetRecord(BaseModel):
    id: str
    name: str
    description: str
    source_dataset_id: str
    source_dataset_name: str
    source_type: str
    source_mappings: list[TargetSourceMapping] = Field(default_factory=list)
    selected_fields: list[str]
    process_rule: dict[str, Any]
    schedule: dict[str, Any]
    output_schema: list[ColumnSchema]
    job_definition: dict[str, Any]
    status: Literal["draft"] = "draft"
    created_at: str
    updated_at: str


class SourceSnapshotRunInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    snapshot_id: str | None = Field(default=None, min_length=1, max_length=160)
    source_dataset_id: str = Field(min_length=1, max_length=120)
    source_type: str | None = Field(default=None, min_length=1, max_length=80)
    artifact_uri: str = Field(min_length=1, max_length=1000)
    format: Literal["parquet"] = "parquet"
    row_count: int | None = Field(default=None, ge=0)
    bytes: int | None = Field(default=None, ge=0)
    schema_fields: list[ColumnSchema] = Field(
        default_factory=list,
        validation_alias="schema",
        serialization_alias="schema",
    )
    created_at: str | None = Field(default=None, min_length=1, max_length=120)
    connection_id: str | None = Field(default=None, min_length=1, max_length=120)
    source_table: str | None = Field(default=None, min_length=1, max_length=500)
    source_topic: str | None = Field(default=None, min_length=1, max_length=500)
    source_collection: str | None = Field(default=None, min_length=1, max_length=500)
    partition_info: dict[str, Any] | None = None


class TargetDatasetRunCreate(BaseModel):
    executor: Literal["airflow", "local_runner", "spark_runner"] = "local_runner"
    triggered_by: str = Field(default="demo_user", min_length=1, max_length=80)
    source_snapshots: list[SourceSnapshotRunInput] = Field(
        default_factory=list,
        validation_alias=AliasChoices("source_snapshots", "source_snapshot_inputs"),
    )


class TargetDatasetRunRecord(BaseModel):
    id: str
    target_dataset_id: str
    target_dataset_name: str
    week2_run_id: str
    pipeline_id: str
    executor: str
    status: str
    job_definition: dict[str, Any]
    execution_result: dict[str, Any]
    created_at: str
    updated_at: str


class TrustGateEvaluationRequest(BaseModel):
    owner: str | None = Field(default=None, min_length=1, max_length=80)
    passed_gates: list[str] = []
    failed_gates: list[str] = []


class PipelineCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    source_dataset_id: str = Field(min_length=1)
    select_fields: list[str] = Field(min_length=1)
    target_name: str = Field(min_length=1, max_length=80)


class PipelineRecord(BaseModel):
    id: str
    name: str
    source_dataset_id: str
    select_fields: list[str]
    target_name: str
    created_at: str


class PipelineRunRecord(BaseModel):
    id: str
    pipeline_id: str
    status: Literal["queued", "running", "success", "failed"]
    result_dataset_id: str | None = None
    result_location: str | None = None
    row_count: int | None = None
    error_message: str | None = None
    logs: list[str] = []
    created_at: str
    updated_at: str


class DashboardCardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    question: str = Field(min_length=1, max_length=500)
    sql: str = Field(min_length=1, max_length=5000)
    chart_spec: dict[str, Any] = Field(min_length=1)
    dataset_id: str = Field(min_length=1, max_length=120)

    @model_validator(mode="after")
    def validate_chart_spec(self) -> "DashboardCardCreate":
        required_fields = ["type", "x", "y", "title"]
        missing_fields = [
            field
            for field in required_fields
            if not isinstance(self.chart_spec.get(field), str) or not self.chart_spec[field].strip()
        ]
        if missing_fields:
            raise ValueError(f"chart_spec missing required fields: {', '.join(missing_fields)}")
        return self


class DashboardCardRecord(BaseModel):
    dashboard_card_id: str
    title: str
    question: str
    sql: str
    chart_spec: dict[str, Any]
    dataset_id: str
    created_at: str


class Week2WorkflowRunRequest(BaseModel):
    executor: Literal["airflow", "local_runner", "spark_runner"] = "local_runner"
    triggered_by: str = Field(default="demo_user", min_length=1, max_length=80)
