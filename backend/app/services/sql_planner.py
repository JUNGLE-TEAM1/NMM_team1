from dataclasses import dataclass
from typing import Literal

from app.domain.ai_query import ChartSpec, SqlEngineContext


SqlIntent = Literal[
    "top_count",
    "top_rating",
    "top_risk",
    "top_negative_review",
    "low_conversion",
    "top_late_delivery",
    "unsupported",
]


@dataclass(frozen=True)
class SqlPlan:
    intent: SqlIntent
    sql: str
    chart_spec: ChartSpec
    failure_code: str | None = None
    failure_message: str | None = None


class SqlPlanner:
    max_limit = 10

    def plan(self, question: str, context: SqlEngineContext) -> SqlPlan:
        intent = self._classify(question)
        if intent == "top_count":
            return self._ranked_plan(
                intent="top_count",
                metric_column="review_count",
                sort_direction="DESC",
                title="Top products by review count",
                context=context,
                optional_columns=["average_rating"],
            )
        if intent == "top_rating":
            return self._ranked_plan(
                intent="top_rating",
                metric_column="average_rating",
                sort_direction="DESC",
                title="Top products by average rating",
                context=context,
                optional_columns=["review_count"],
            )
        if intent == "top_risk":
            return self._ranked_plan(
                intent="top_risk",
                metric_column="risk_score",
                sort_direction="DESC",
                title="Top products by risk score",
                context=context,
                optional_columns=["category", "product_name", "negative_review_rate", "conversion_rate", "late_delivery_rate"],
            )
        if intent == "top_negative_review":
            return self._ranked_plan(
                intent="top_negative_review",
                metric_column="negative_review_rate",
                sort_direction="DESC",
                title="Top products by negative review rate",
                context=context,
                optional_columns=["category", "product_name", "risk_score", "conversion_rate", "late_delivery_rate"],
            )
        if intent == "low_conversion":
            return self._ranked_plan(
                intent="low_conversion",
                metric_column="conversion_rate",
                sort_direction="ASC",
                title="Lowest products by conversion rate",
                context=context,
                optional_columns=["category", "product_name", "risk_score", "negative_review_rate", "late_delivery_rate"],
            )
        if intent == "top_late_delivery":
            return self._ranked_plan(
                intent="top_late_delivery",
                metric_column="late_delivery_rate",
                sort_direction="DESC",
                title="Top products by late delivery rate",
                context=context,
                optional_columns=["category", "product_name", "risk_score", "negative_review_rate", "conversion_rate"],
            )
        return self._unsupported_plan(
            "지원하지 않는 질문입니다. 현재는 CatalogMetadata가 허용한 상품 순위/위험 지표 질문만 지원합니다."
        )

    def _classify(self, question: str) -> SqlIntent:
        normalized = question.lower()
        unsupported_terms = [
            "예측",
            "forecast",
            "prediction",
            "내일",
            "미래",
            "매출",
            "revenue",
            "감성",
            "sentiment",
        ]
        if any(term in normalized for term in unsupported_terms):
            return "unsupported"

        if any(term in normalized for term in ["위험", "리스크", "risk", "risk_score"]):
            return "top_risk"

        if any(term in normalized for term in ["부정", "negative_review", "negative review", "negative", "불만"]):
            return "top_negative_review"

        if any(term in normalized for term in ["전환율", "conversion", "구매 전환", "구매율"]):
            return "low_conversion"

        if any(term in normalized for term in ["배송 지연", "지연율", "late_delivery", "late delivery", "delivery delay", "shipping delay"]):
            return "top_late_delivery"

        if any(term in normalized for term in ["평점", "별점", "rating", "average"]):
            return "top_rating"

        if any(term in normalized for term in ["리뷰", "review", "count", "많", "상품", "product", "amazon"]):
            return "top_count"

        return "unsupported"

    def _ranked_plan(
        self,
        intent: SqlIntent,
        metric_column: str,
        sort_direction: str,
        title: str,
        context: SqlEngineContext,
        optional_columns: list[str],
    ) -> SqlPlan:
        columns = self._columns_or_none(["product_id", metric_column], optional_columns, context)
        if columns is None:
            return self._unsupported_plan(
                f"CatalogMetadata allowed_columns에 product_id 또는 {metric_column}가 없어 SQL을 만들 수 없습니다."
            )

        sql = (
            f"SELECT {', '.join(columns)} "
            f"FROM {context.table_name} "
            f"ORDER BY {metric_column} {sort_direction} LIMIT {self._limit(context)}"
        )
        return SqlPlan(
            intent=intent,
            sql=sql,
            chart_spec=ChartSpec(
                type="bar",
                x="product_id",
                y=metric_column,
                title=title,
            ),
        )

    def _columns_or_none(
        self,
        required_columns: list[str],
        optional_columns: list[str],
        context: SqlEngineContext,
    ) -> list[str] | None:
        allowed = set(context.allowed_columns)
        if not set(required_columns).issubset(allowed):
            return None

        columns: list[str] = []
        for column in required_columns + optional_columns:
            if column in allowed and column not in columns:
                columns.append(column)
        return columns

    def _limit(self, context: SqlEngineContext) -> int:
        return max(1, min(context.default_limit, self.max_limit))

    def _unsupported_plan(self, message: str) -> SqlPlan:
        return SqlPlan(
            intent="unsupported",
            sql="",
            chart_spec=ChartSpec(
                type="none",
                x="",
                y="",
                title="Unsupported question",
            ),
            failure_code="unsupported_question",
            failure_message=message,
        )
