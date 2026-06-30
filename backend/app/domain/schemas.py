from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


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
    lineage: dict[str, object] | None = None
    metrics: dict[str, object] | None = None
    storage: dict[str, object] | None = None
    runtime_evidence: dict[str, object] | None = None
    source_evidence: list[dict[str, object]] = Field(default_factory=list)
    error_message: str | None = None
    created_at: str


class SourceRegistration(BaseModel):
    source: SourceRecord
    dataset: CatalogDataset


ConnectionType = Literal[
    "csv",
    "kafka",
    "postgres",
    "mongodb",
    "api",
    "s3",
    "local_file",
    "local_folder",
    "database",
    "object_storage",
]

SyncMode = Literal["manual", "scheduled", "streaming"]


class ExternalConnectionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    connector_type: ConnectionType
    resource: str = Field(min_length=1, max_length=500)
    resource_label: str = Field(min_length=1, max_length=80)
    auth_mode: str = Field(min_length=1, max_length=120)
    mode_label: str = Field(min_length=1, max_length=120)
    contract_hint: str = Field(min_length=1, max_length=200)
    detected_format: str | None = Field(default=None, max_length=120)
    detected_dataset: str | None = Field(default=None, max_length=120)
    confidence: str | None = Field(default=None, max_length=80)
    recommended_role: str | None = Field(default=None, max_length=120)
    sync_mode: SyncMode = "manual"
    sync_schedule: str = Field(default="manual on demand", min_length=1, max_length=160)
    schema_preview: list[ColumnSchema] = Field(default_factory=list)


class ExternalConnectionInspectRequest(BaseModel):
    connector_type: ConnectionType
    resource: str = Field(min_length=1, max_length=500)
    resource_label: str | None = Field(default=None, max_length=80)
    secret_refs: dict[str, str] = Field(default_factory=dict)
    options: dict[str, str] = Field(default_factory=dict)
    sample_size: int = Field(default=5, ge=1, le=20)


class ExternalConnectionInspectResult(BaseModel):
    connector_type: str
    resource: str
    resource_label: str
    detected_format: str
    detected_dataset: str
    confidence: str
    recommended_role: str
    schema_preview: list[ColumnSchema]
    sample_rows: list[dict[str, object]] = Field(default_factory=list)
    bytes: int
    file_count: int | None = None
    row_count: int | None = None
    row_count_status: str = "not_measured"
    status: str = "discovered"
    message: str


RuntimeConnectionType = Literal["postgres", "mongodb", "s3", "object_storage", "kafka"]


class ExternalConnectionTestRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    connector_type: RuntimeConnectionType
    resource: str = Field(min_length=1, max_length=500)
    resource_label: str | None = Field(default=None, max_length=80)
    secret_refs: dict[str, str] = Field(default_factory=dict)
    options: dict[str, str] = Field(default_factory=dict)
    timeout_seconds: float = Field(default=3.0, gt=0, le=15)


class ExternalConnectionTestResult(BaseModel):
    status: Literal["passed", "failed"]
    connector_type: RuntimeConnectionType
    checked_capabilities: list[str]
    safe_summary: dict[str, object]
    secret_values_exposed: Literal[False] = False
    schema_discovery_completed: Literal[False] = False
    message: str


class ExternalConnectionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    resource: str | None = Field(default=None, min_length=1, max_length=500)
    resource_label: str | None = Field(default=None, min_length=1, max_length=80)
    auth_mode: str | None = Field(default=None, min_length=1, max_length=120)
    mode_label: str | None = Field(default=None, min_length=1, max_length=120)
    contract_hint: str | None = Field(default=None, min_length=1, max_length=200)
    detected_format: str | None = Field(default=None, max_length=120)
    detected_dataset: str | None = Field(default=None, max_length=120)
    confidence: str | None = Field(default=None, max_length=80)
    recommended_role: str | None = Field(default=None, max_length=120)
    sync_mode: SyncMode | None = None
    sync_schedule: str | None = Field(default=None, min_length=1, max_length=160)
    schema_preview: list[ColumnSchema] | None = None


class ExternalConnectionRecord(BaseModel):
    id: str
    name: str
    connector_type: str
    resource: str
    resource_label: str
    auth_mode: str
    mode_label: str
    contract_hint: str
    detected_format: str | None = None
    detected_dataset: str | None = None
    confidence: str | None = None
    recommended_role: str | None = None
    sync_mode: SyncMode = "manual"
    sync_schedule: str = "manual on demand"
    schema_preview: list[ColumnSchema] = Field(default_factory=list)
    status: str
    created_at: str
    updated_at: str


class SourceDatasetCreate(BaseModel):
    connection_id: str = Field(min_length=1, max_length=120)
    connection_name: str = Field(min_length=1, max_length=120)
    connection_type: ConnectionType
    name: str = Field(min_length=1, max_length=120)
    raw_scope: str = Field(min_length=1, max_length=500)
    resource_label: str = Field(min_length=1, max_length=80)
    schema_preview: list[ColumnSchema] = Field(min_length=1)


class SourceDatasetUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    raw_scope: str | None = Field(default=None, min_length=1, max_length=500)
    resource_label: str | None = Field(default=None, min_length=1, max_length=80)
    schema_preview: list[ColumnSchema] | None = Field(default=None, min_length=1)
    status: str | None = Field(default=None, min_length=1, max_length=80)


class DatasetFileEvidence(BaseModel):
    status: Literal["file_backed", "missing", "metadata_only"]
    path: str | None = None
    bytes: int | None = None
    row_count: int | None = None
    row_count_status: str = "not_measured"
    schema_fields: int | None = None
    message: str


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
    file_evidence: DatasetFileEvidence | None = None


class ProductHealthSourceInventoryItem(BaseModel):
    role: str
    label: str
    source_dataset_name: str
    connection_name: str
    connection_type: ConnectionType
    resource_label: str
    path: str
    binding_type: Literal["raw_file", "prepared_dataset", "missing", "mismatch"]
    status: Literal["ready", "missing", "mismatch"]
    can_create_source_dataset: bool
    bytes: int | None = None
    row_count: int | None = None
    row_count_status: str = "not_measured"
    schema_preview: list[ColumnSchema] = Field(default_factory=list)
    message: str


class ProductHealthSourceInventory(BaseModel):
    scenario_id: str = "product_health"
    status: Literal["ready", "partial", "missing"]
    sources: list[ProductHealthSourceInventoryItem]
    message: str


class SourceDatasetSnapshotCreate(BaseModel):
    sample_size: int = Field(default=100, ge=1, le=10000)
    secret_refs: dict[str, str] = Field(default_factory=dict)
    options: dict[str, str] = Field(default_factory=dict)


class SourceDatasetSnapshotRecord(BaseModel):
    id: str
    source_dataset_id: str
    source_dataset_name: str
    connection_id: str
    connection_type: str
    input_scope: str
    output_path: str
    row_count: int
    output_bytes: int
    input_bytes: int | None = None
    snapshot_mode: str = "bounded_sample"
    requested_sample_size: int | None = None
    row_limit: int | None = None
    coverage_status: str = "bounded_sample_not_full_ingest"
    input_bytes_semantics: str = "available_input_bytes"
    large_data_status: str = "not_full_large_data_ingest"
    status: Literal["succeeded", "failed"]
    duration_ms: int
    message: str
    created_at: str


class TargetDatasetSchedule(BaseModel):
    mode: Literal["manual", "placeholder"] = "manual"
    note: str = Field(default="", max_length=240)


class SilverDatasetCreate(BaseModel):
    source_dataset_id: str = Field(min_length=1, max_length=160)
    source_dataset_name: str = Field(min_length=1, max_length=160)
    name: str = Field(min_length=1, max_length=160)
    purpose: str = Field(min_length=1, max_length=300)
    standardize_rules: list[str] = Field(min_length=1)
    validation_rules: list[str] = Field(min_length=1)
    schedule: TargetDatasetSchedule = Field(default_factory=TargetDatasetSchedule)
    schema_preview: list[ColumnSchema] = Field(min_length=1)


class SilverDatasetUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    purpose: str | None = Field(default=None, min_length=1, max_length=300)
    standardize_rules: list[str] | None = Field(default=None, min_length=1)
    validation_rules: list[str] | None = Field(default=None, min_length=1)
    schema_preview: list[ColumnSchema] | None = Field(default=None, min_length=1)
    status: str | None = Field(default=None, min_length=1, max_length=80)


class SilverDatasetRecord(SilverDatasetCreate):
    id: str
    layer: Literal["silver"] = "silver"
    status: str
    created_at: str
    updated_at: str
    file_evidence: DatasetFileEvidence | None = None


class SilverDatasetMaterializationCreate(BaseModel):
    sample_size: int = Field(default=10000, ge=1, le=100000)
    prefer_latest_source_snapshot: bool = True


class SilverDatasetMaterializationRecord(BaseModel):
    id: str
    silver_dataset_id: str
    silver_dataset_name: str
    source_dataset_id: str
    source_dataset_name: str
    input_path: str
    output_path: str
    row_count: int
    output_bytes: int
    failed_row_count: int
    status: Literal["succeeded", "failed"]
    duration_ms: int
    message: str
    created_at: str


class TargetDatasetSourceRef(BaseModel):
    source_id: str = Field(min_length=1, max_length=160)
    name: str = Field(min_length=1, max_length=160)
    role: Literal["base", "enrichment"]
    type_label: str = Field(min_length=1, max_length=120)
    resource: str = Field(min_length=1, max_length=500)


class TargetDatasetSilverOutput(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    from_source_id: str = Field(min_length=1, max_length=160)
    from_source_name: str = Field(min_length=1, max_length=160)
    purpose: str = Field(min_length=1, max_length=240)


class TargetDatasetDraftCreate(BaseModel):
    target_dataset_name: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1, max_length=300)
    base_source_ref: TargetDatasetSourceRef
    target_grain: str = Field(min_length=1, max_length=120)
    source_refs: list[TargetDatasetSourceRef] = Field(min_length=2)
    silver_outputs: list[TargetDatasetSilverOutput] = Field(min_length=1)
    processing_recipes: list[str] = Field(min_length=1)
    gold_output: str = Field(min_length=1, max_length=160)
    executor_handoff: Literal["local_runner", "airflow", "spark_runner"]
    schedule: TargetDatasetSchedule
    schema_preview: list[ColumnSchema] = Field(min_length=1)


class TargetDatasetDraftUpdate(BaseModel):
    target_dataset_name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, min_length=1, max_length=300)
    base_source_ref: TargetDatasetSourceRef | None = None
    target_grain: str | None = Field(default=None, min_length=1, max_length=120)
    source_refs: list[TargetDatasetSourceRef] | None = Field(default=None, min_length=2)
    silver_outputs: list[TargetDatasetSilverOutput] | None = Field(default=None, min_length=1)
    processing_recipes: list[str] | None = Field(default=None, min_length=1)
    gold_output: str | None = Field(default=None, min_length=1, max_length=160)
    executor_handoff: Literal["local_runner", "airflow", "spark_runner"] | None = None
    schema_preview: list[ColumnSchema] | None = Field(default=None, min_length=1)
    status: str | None = Field(default=None, min_length=1, max_length=80)


class TargetDatasetDraftRecord(TargetDatasetDraftCreate):
    id: str
    layer: Literal["target"] = "target"
    status: str
    created_at: str
    updated_at: str
    file_evidence: DatasetFileEvidence | None = None


class TargetDatasetJobRunCreate(BaseModel):
    target_dataset_draft_id: str = Field(min_length=1, max_length=160)
    job_type: Literal["gold_build"] = "gold_build"
    triggered_by: str = Field(default="demo_user", min_length=1, max_length=80)


class TargetDatasetJobRunRecord(BaseModel):
    id: str
    target_dataset_draft_id: str
    target_dataset_name: str
    gold_output: str
    job_type: Literal["gold_build"] = "gold_build"
    status: Literal["queued", "ready_to_run", "running", "succeeded", "failed"]
    executor_handoff: Literal["local_runner", "airflow", "spark_runner"]
    schedule: TargetDatasetSchedule
    source_count: int
    silver_output_count: int
    processing_recipes: list[str] = Field(default_factory=list)
    triggered_by: str
    run_note: str
    output_path: str | None = None
    row_count: int | None = None
    output_bytes: int | None = None
    silver_output_paths: list[str] = Field(default_factory=list)
    logs: list[str] = Field(default_factory=list)
    duration_ms: int | None = None
    source_evidence: list[dict[str, object]] = Field(default_factory=list)
    runtime_evidence: dict[str, object] = Field(default_factory=dict)
    created_at: str
    updated_at: str


class TrustGateEvaluationRequest(BaseModel):
    owner: str | None = Field(default=None, min_length=1, max_length=80)
    passed_gates: list[str] = Field(default_factory=list)
    failed_gates: list[str] = Field(default_factory=list)


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
    logs: list[str] = Field(default_factory=list)
    created_at: str
    updated_at: str


class Week2WorkflowRunRequest(BaseModel):
    executor: Literal["airflow", "local_runner", "spark_runner"] = "local_runner"
    triggered_by: str = Field(default="demo_user", min_length=1, max_length=80)
