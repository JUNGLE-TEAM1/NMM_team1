from app.domain.target_contracts import PolicyDecision, QueryExecution
from app.ports.policy_engine import PolicyEngine
from app.ports.query_engine import QueryEngine


class QueryPolicyService:
    def __init__(self, policy_engine: PolicyEngine, query_engine: QueryEngine) -> None:
        self.policy_engine = policy_engine
        self.query_engine = query_engine

    def preflight_and_execute(
        self,
        actor: str,
        dataset_id: str,
        sql_or_plan: str,
    ) -> tuple[PolicyDecision, QueryExecution]:
        decision = self.policy_engine.decide(
            actor=actor,
            action="query",
            resource_ref=dataset_id,
        )
        execution = self.query_engine.execute(
            dataset_id=dataset_id,
            sql_or_plan=sql_or_plan,
            policy_decision=decision,
        )
        return decision, execution
