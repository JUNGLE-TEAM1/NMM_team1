from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from pydantic import BaseModel, Field

from app.domain.schemas import ColumnSchema


def make_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


class DatasetStatus(StrEnum):
    DRAFT = "Draft"
    VERIFYING = "Verifying"
    TRUSTED = "Trusted"
    DEGRADED = "Degraded"
    BLOCKED = "Blocked"
    ARCHIVED = "Archived"


class PolicyDecisionResult(StrEnum):
    ALLOW = "allow"
    DENY = "deny"
    MASK = "mask"


class QueryExecutionStatus(StrEnum):
    PLANNED = "planned"
    SUCCEEDED = "succeeded"
    DENIED = "denied"
    FAILED = "failed"


class Dataset(BaseModel):
    id: str
    name: str
    source_ref: str
    schema_version: str
    status: DatasetStatus
    owner: str
    freshness: str | None = None
    trust_gate_result_id: str | None = None


class TrustGateResult(BaseModel):
    id: str = Field(default_factory=lambda: make_id("trust_gate"))
    dataset_id: str
    status: DatasetStatus
    required_gates: list[str]
    passed_gates: list[str] = []
    failed_gates: list[str] = []
    reasons: list[str] = []
    evaluated_at: str = Field(default_factory=now_iso)


class SourceConnection(BaseModel):
    id: str = Field(default_factory=lambda: make_id("source"))
    type: str
    display_name: str
    secret_ref: str | None = None
    connection_status: str
    last_checked_at: str = Field(default_factory=now_iso)


class SchemaSnapshot(BaseModel):
    source_id: str
    dataset_id: str
    columns: list[ColumnSchema]
    sample_ref: str | None = None
    row_count: int
    captured_at: str = Field(default_factory=now_iso)


class JobRun(BaseModel):
    id: str = Field(default_factory=lambda: make_id("job"))
    job_type: str
    status: str
    dataset_id: str
    idempotency_key: str
    started_at: str = Field(default_factory=now_iso)
    finished_at: str | None = None


class TaskRun(BaseModel):
    id: str = Field(default_factory=lambda: make_id("task"))
    job_run_id: str
    task_type: str
    status: str
    attempt: int = 1
    error_summary: str | None = None


class AuditEvent(BaseModel):
    id: str = Field(default_factory=lambda: make_id("audit"))
    actor: str
    action: str
    resource_ref: str
    policy_decision_id: str | None = None
    created_at: str = Field(default_factory=now_iso)


class PolicyDecision(BaseModel):
    id: str = Field(default_factory=lambda: make_id("policy"))
    actor: str
    action: str
    resource_ref: str
    decision: PolicyDecisionResult
    masking: list[str] = []
    reason: str
    decided_at: str = Field(default_factory=now_iso)


class QueryExecution(BaseModel):
    id: str = Field(default_factory=lambda: make_id("query"))
    dataset_id: str
    status: QueryExecutionStatus
    sql_or_plan: str
    policy_decision_id: str
    evidence_refs: list[str] = []


class EvidenceItem(BaseModel):
    id: str = Field(default_factory=lambda: make_id("evidence"))
    type: str
    resource_ref: str
    summary: str
    freshness: str | None = None
    policy_decision_id: str | None = None
    trace_ref: str | None = None


class RetrievalTrace(BaseModel):
    id: str = Field(default_factory=lambda: make_id("trace"))
    question: str
    route: str
    retrieved_refs: list[str] = []
    blocked_refs: list[str] = []
    policy_decision_id: str | None = None


class AssetImpact(BaseModel):
    id: str = Field(default_factory=lambda: make_id("impact"))
    source_event_ref: str
    affected_assets: list[str]
    severity: str
    reason: str


class RecoveryAction(BaseModel):
    id: str = Field(default_factory=lambda: make_id("recovery"))
    type: str
    target_ref: str
    range: str | None = None
    idempotency_key: str
    status: str


class ModuleHealth(BaseModel):
    module: str
    status: str
    checks: list[str] = []
    config_warnings: list[str] = []
    checked_at: str = Field(default_factory=now_iso)
