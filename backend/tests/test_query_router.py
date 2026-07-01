from app.domain.ai_query import ChartSpec
from app.services.query_router import QueryRouter
from app.services.sql_planner import SqlPlan


def _plan(intent: str) -> SqlPlan:
    if intent == "unsupported":
        return SqlPlan(
            intent="unsupported",
            sql="",
            chart_spec=ChartSpec(type="none", x="", y="", title="Unsupported question"),
            failure_code="unsupported_question",
            failure_message="지원하지 않는 질문입니다.",
        )
    return SqlPlan(
        intent=intent,
        sql="SELECT product_id FROM gold_product_health LIMIT 10",
        chart_spec=ChartSpec(type="bar", x="product_id", y="risk_score", title="Demo"),
    )


def test_query_router_keeps_metric_question_on_sql_route() -> None:
    decision = QueryRouter().decide("위험 점수가 높은 상품 알려줘", _plan("top_risk"))

    assert decision.route == "sql"
    assert decision.requires_sql is True
    assert decision.uses_rag is False


def test_query_router_uses_hybrid_when_sql_question_asks_for_evidence() -> None:
    decision = QueryRouter().decide("위험 점수가 높은 상품과 그 근거를 설명해줘", _plan("top_risk"))

    assert decision.route == "hybrid"
    assert decision.requires_sql is True
    assert decision.uses_rag is True
    assert "근거" in decision.reason_terms


def test_query_router_uses_rag_for_catalog_metadata_question() -> None:
    decision = QueryRouter().decide("이 데이터셋의 스키마와 lineage 근거를 알려줘", _plan("unsupported"))

    assert decision.route == "rag"
    assert decision.requires_sql is False
    assert decision.uses_rag is True
    assert "스키마" in decision.reason_terms


def test_query_router_keeps_blocked_prediction_unsupported() -> None:
    decision = QueryRouter().decide("내일 매출을 예측해줘", _plan("unsupported"))

    assert decision.route == "unsupported"
    assert decision.requires_sql is False
    assert decision.uses_rag is False
    assert decision.failure_code == "unsupported_question"
