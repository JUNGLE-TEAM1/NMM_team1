from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ColumnSchema(BaseModel):
    name: str
    type: str


class SourceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    type: Literal["csv", "json"]
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


class JsonFieldProfile(BaseModel):
    source_path: str
    target_name: str
    inferred_type: str
    observed_count: int
    missing_count: int
    nullable: bool
    array: bool = False
    nested: bool = False
    sample_values: list[object] = []


class JsonProfile(BaseModel):
    dataset_id: str
    format: str
    record_path: str
    sampled_rows: int
    sample_limited: bool
    fields: list[JsonFieldProfile]


class SilverRecommendationColumn(BaseModel):
    source_path: str
    target_name: str
    target_type: str
    include: bool
    transform: str
    nullable: bool
    confidence: float
    reason: str


class SilverUserDecision(BaseModel):
    source_path: str
    decision: str
    options: list[str]
    default: str
    reason: str


class SilverRecommendation(BaseModel):
    recommendation_id: str
    source_dataset_id: str
    target_dataset_id: str
    record_path: str
    mode: str
    columns: list[SilverRecommendationColumn]
    needs_user_decision: list[SilverUserDecision] = []


class GoldMetric(BaseModel):
    name: str
    function: str
    column: str | None = None
    condition: str | None = None


class GoldRecommendation(BaseModel):
    recommendation_id: str
    source_dataset_id: str
    target_dataset_id: str
    type: str
    group_by: list[str] = []
    metrics: list[GoldMetric]
    recommended_questions: list[str] = []
    confidence: float
    reason: str


class CatalogMetadataDraft(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    dataset_id: str
    name: str
    layer: str
    source_dataset_id: str | None = None
    record_path: str | None = None
    storage_uri: str | None = None
    schema_fields: list[dict[str, object]] = Field(alias="schema")
    metrics: dict[str, object]
    quality: dict[str, object]
    lineage: dict[str, object]
    status: str


class JsonRecommendationBundle(BaseModel):
    profile: JsonProfile
    bronze_catalog_metadata: CatalogMetadataDraft
    silver_recommendation: SilverRecommendation
    silver_catalog_metadata: CatalogMetadataDraft
    gold_recommendation: GoldRecommendation
    gold_catalog_metadata: CatalogMetadataDraft
