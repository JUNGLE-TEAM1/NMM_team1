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
    error_message: str | None = None
    created_at: str


class SourceRegistration(BaseModel):
    source: SourceRecord
    dataset: CatalogDataset


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


class Week2WorkflowRunRequest(BaseModel):
    executor: Literal["airflow", "local_runner"] = "local_runner"
    triggered_by: str = Field(default="demo_user", min_length=1, max_length=80)
