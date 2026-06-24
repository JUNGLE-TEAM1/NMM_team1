from app.domain.target_contracts import (
    AuditEvent,
    Dataset,
    DatasetStatus,
    JobRun,
    ModuleHealth,
    PolicyDecision,
    PolicyDecisionResult,
    QueryExecutionStatus,
    SourceConnection,
)
from app.fakes.fake_policy_engine import FakePolicyEngine
from app.fakes.fake_query_engine import FakeQueryEngine
from app.fakes.fake_source_connector import FakeSourceConnector
from app.fakes.in_memory_job_runner import InMemoryJobRunner
from app.services.catalog_trust import CatalogTrustService


def test_target_contracts_are_importable() -> None:
    dataset = Dataset(
        id="dataset_orders",
        name="orders",
        source_ref="source_orders",
        schema_version="schema_v1",
        status=DatasetStatus.DRAFT,
        owner="data-team",
    )

    assert dataset.status is DatasetStatus.DRAFT
    assert dataset.trust_gate_result_id is None

    health = ModuleHealth(module="catalog_trust", status="ok", checks=["import"])
    assert health.module == "catalog_trust"


def test_fake_policy_engine_returns_allow_deny_and_mask() -> None:
    engine = FakePolicyEngine(
        denied_resources={"dataset_blocked"},
        masked_resources={"dataset_masked": ["email"]},
    )

    allowed = engine.decide(actor="analyst", action="query", resource_ref="dataset_trusted")
    denied = engine.decide(actor="analyst", action="query", resource_ref="dataset_blocked")
    masked = engine.decide(actor="analyst", action="query", resource_ref="dataset_masked")

    assert allowed.decision is PolicyDecisionResult.ALLOW
    assert denied.decision is PolicyDecisionResult.DENY
    assert masked.decision is PolicyDecisionResult.MASK
    assert masked.masking == ["email"]


def test_fake_source_connector_returns_schema_snapshot() -> None:
    connector = FakeSourceConnector()

    source = connector.connect(display_name="orders_fixture")
    snapshot = connector.discover_schema(source.id)

    assert isinstance(source, SourceConnection)
    assert source.connection_status == "connected"
    assert snapshot.source_id == source.id
    assert snapshot.columns[0].name == "order_id"
    assert snapshot.row_count == 2


def test_fake_query_engine_keeps_policy_boundary() -> None:
    policy = PolicyDecision(
        id="policy_1",
        actor="analyst",
        action="query",
        resource_ref="dataset_trusted",
        decision=PolicyDecisionResult.ALLOW,
        reason="fixture allow",
    )
    query = FakeQueryEngine().execute(
        dataset_id="dataset_trusted",
        sql_or_plan="select order_id from dataset_trusted",
        policy_decision=policy,
    )

    assert query.status is QueryExecutionStatus.SUCCEEDED
    assert query.policy_decision_id == policy.id
    assert query.evidence_refs == ["policy_1"]


def test_in_memory_job_runner_records_audit_event() -> None:
    runner = InMemoryJobRunner()

    run = runner.run(job_type="schema_discovery", dataset_id="dataset_orders")

    assert isinstance(run, JobRun)
    assert run.status == "succeeded"
    assert isinstance(runner.audit_events[0], AuditEvent)
    assert runner.audit_events[0].resource_ref == run.id


def test_catalog_trust_service_creates_draft_dataset_and_gate_result() -> None:
    service = CatalogTrustService()

    dataset, gate = service.create_draft_dataset(
        dataset_id="dataset_orders",
        name="orders",
        source_ref="source_orders",
        owner="data-team",
    )

    assert dataset.status is DatasetStatus.DRAFT
    assert dataset.trust_gate_result_id == gate.id
    assert gate.dataset_id == dataset.id
    assert "policy" in gate.required_gates
