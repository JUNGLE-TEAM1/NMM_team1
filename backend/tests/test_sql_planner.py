from app.domain.ai_query import SqlEngineContext
from app.services.sql_planner import SqlPlanner


def _context(default_limit: int = 100) -> SqlEngineContext:
    return SqlEngineContext(
        table_name="reviews_gold",
        allowed_columns=["product_id", "review_count", "average_rating"],
        local_fallback_path="/tmp/reviews_gold.jsonl",
        default_limit=default_limit,
        timeout_seconds=30,
        column_types={
            "product_id": "string",
            "review_count": "integer",
            "average_rating": "number",
        },
    )


def _product_health_context(default_limit: int = 100) -> SqlEngineContext:
    return SqlEngineContext(
        table_name="gold_product_health",
        allowed_columns=[
            "product_id",
            "category",
            "product_name",
            "risk_score",
            "negative_review_rate",
            "conversion_rate",
            "late_delivery_rate",
        ],
        local_fallback_path="/tmp/gold_product_health.parquet",
        default_limit=default_limit,
        timeout_seconds=30,
        column_types={
            "product_id": "string",
            "category": "string",
            "product_name": "string",
            "risk_score": "number",
            "negative_review_rate": "number",
            "conversion_rate": "number",
            "late_delivery_rate": "number",
        },
    )


def test_sql_planner_builds_top_count_sql_from_catalog_context() -> None:
    plan = SqlPlanner().plan("리뷰가 가장 많은 상품 알려줘", _context(default_limit=5))

    assert plan.intent == "top_count"
    assert plan.sql == (
        "SELECT product_id, review_count, average_rating "
        "FROM reviews_gold ORDER BY review_count DESC LIMIT 5"
    )
    assert plan.chart_spec.y == "review_count"


def test_sql_planner_builds_top_rating_sql_from_catalog_context() -> None:
    plan = SqlPlanner().plan("Amazon reviews에서 평점 높은 상품 알려줘", _context())

    assert plan.intent == "top_rating"
    assert plan.sql == (
        "SELECT product_id, average_rating, review_count "
        "FROM reviews_gold ORDER BY average_rating DESC LIMIT 10"
    )
    assert plan.chart_spec.y == "average_rating"


def test_sql_planner_builds_top_risk_sql_from_product_health_context() -> None:
    plan = SqlPlanner().plan("위험 점수가 높은 상품 알려줘", _product_health_context())

    assert plan.intent == "top_risk"
    assert plan.sql == (
        "SELECT product_id, risk_score, category, product_name, negative_review_rate, "
        "conversion_rate, late_delivery_rate FROM gold_product_health "
        "ORDER BY risk_score DESC LIMIT 10"
    )
    assert plan.chart_spec.y == "risk_score"


def test_sql_planner_builds_negative_review_sql_from_product_health_context() -> None:
    plan = SqlPlanner().plan("부정 리뷰율 높은 상품 알려줘", _product_health_context())

    assert plan.intent == "top_negative_review"
    assert plan.sql == (
        "SELECT product_id, negative_review_rate, category, product_name, risk_score, "
        "conversion_rate, late_delivery_rate FROM gold_product_health "
        "ORDER BY negative_review_rate DESC LIMIT 10"
    )
    assert plan.chart_spec.y == "negative_review_rate"


def test_sql_planner_builds_low_conversion_sql_from_product_health_context() -> None:
    plan = SqlPlanner().plan("전환율 낮은 상품 알려줘", _product_health_context(default_limit=3))

    assert plan.intent == "low_conversion"
    assert plan.sql == (
        "SELECT product_id, conversion_rate, category, product_name, risk_score, "
        "negative_review_rate, late_delivery_rate FROM gold_product_health "
        "ORDER BY conversion_rate ASC LIMIT 3"
    )
    assert plan.chart_spec.y == "conversion_rate"


def test_sql_planner_builds_late_delivery_sql_from_product_health_context() -> None:
    plan = SqlPlanner().plan("배송 지연율 높은 상품 알려줘", _product_health_context())

    assert plan.intent == "top_late_delivery"
    assert plan.sql == (
        "SELECT product_id, late_delivery_rate, category, product_name, risk_score, "
        "negative_review_rate, conversion_rate FROM gold_product_health "
        "ORDER BY late_delivery_rate DESC LIMIT 10"
    )
    assert plan.chart_spec.y == "late_delivery_rate"


def test_sql_planner_blocks_when_required_metric_is_not_allowed() -> None:
    context = SqlEngineContext(
        table_name="gold_product_health",
        allowed_columns=["product_id", "negative_review_rate"],
        local_fallback_path="/tmp/gold_product_health.parquet",
        default_limit=100,
        timeout_seconds=30,
        column_types={
            "product_id": "string",
            "negative_review_rate": "number",
        },
    )

    plan = SqlPlanner().plan("위험 점수가 높은 상품 알려줘", context)

    assert plan.intent == "unsupported"
    assert plan.sql == ""
    assert plan.failure_code == "unsupported_question"
    assert "risk_score" in (plan.failure_message or "")


def test_sql_planner_marks_unsupported_questions_without_sql() -> None:
    plan = SqlPlanner().plan("내일 매출을 예측해줘", _context())

    assert plan.intent == "unsupported"
    assert plan.sql == ""
    assert plan.failure_code == "unsupported_question"
    assert "지원하지 않는 질문" in (plan.failure_message or "")
