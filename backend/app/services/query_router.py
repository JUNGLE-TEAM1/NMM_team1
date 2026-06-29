from dataclasses import dataclass, field
from typing import Literal

from app.services.sql_planner import SqlPlan


RouteName = Literal["sql", "rag", "hybrid", "unsupported"]


@dataclass(frozen=True)
class QueryRouteDecision:
    route: RouteName
    requires_sql: bool
    uses_rag: bool
    reason_terms: list[str] = field(default_factory=list)
    failure_code: str | None = None
    failure_message: str | None = None


class QueryRouter:
    _rag_terms = (
        "근거",
        "증거",
        "설명",
        "왜",
        "스키마",
        "schema",
        "라인리지",
        "lineage",
        "계보",
        "컬럼",
        "column",
        "field",
        "필드",
        "metric",
        "메트릭",
        "quality",
        "품질",
        "catalog",
        "카탈로그",
        "데이터셋",
        "dataset",
        "run_id",
        "run",
        "pipeline",
        "파이프라인",
    )
    _blocked_terms = (
        "예측",
        "forecast",
        "prediction",
        "내일",
        "미래",
        "매출",
        "revenue",
        "감성",
        "sentiment",
    )

    def decide(self, question: str, plan: SqlPlan) -> QueryRouteDecision:
        normalized = question.lower()
        if self._contains_any(normalized, self._blocked_terms):
            return self._unsupported(plan)

        rag_terms = self._matched_terms(normalized, self._rag_terms)
        has_sql_route = plan.intent != "unsupported"
        has_rag_route = bool(rag_terms)

        if has_sql_route and has_rag_route:
            return QueryRouteDecision(
                route="hybrid",
                requires_sql=True,
                uses_rag=True,
                reason_terms=rag_terms,
            )
        if has_sql_route:
            return QueryRouteDecision(route="sql", requires_sql=True, uses_rag=False)
        if has_rag_route:
            return QueryRouteDecision(
                route="rag",
                requires_sql=False,
                uses_rag=True,
                reason_terms=rag_terms,
            )
        return self._unsupported(plan)

    def _unsupported(self, plan: SqlPlan) -> QueryRouteDecision:
        return QueryRouteDecision(
            route="unsupported",
            requires_sql=False,
            uses_rag=False,
            failure_code=plan.failure_code or "unsupported_question",
            failure_message=plan.failure_message or "지원하지 않는 질문입니다.",
        )

    def _matched_terms(self, normalized_question: str, terms: tuple[str, ...]) -> list[str]:
        return [term for term in terms if term in normalized_question]

    def _contains_any(self, normalized_question: str, terms: tuple[str, ...]) -> bool:
        return any(term in normalized_question for term in terms)
