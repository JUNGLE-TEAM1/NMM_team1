from pathlib import Path
from typing import Any

from app.adapters.fixture_catalog_source import FixtureCatalogSource
from app.domain.ai_query import (
    AIQueryResult,
    ChartSpec,
    GuardrailResult,
    QueryEvidence,
    QueryResult,
    SelectedDataset,
    SqlEngineContext,
)
from app.domain.target_contracts import now_iso
from app.ports.catalog_source import CatalogSource
from app.ports.sql_engine import SqlEngineAdapter
from app.services.catalog_retriever import CatalogRetriever


class Week2AIQueryService:
    def __init__(
        self,
        sql_engine: SqlEngineAdapter,
        catalog_source: CatalogSource | None = None,
        catalog_retriever: CatalogRetriever | None = None,
        catalog_path: Path | None = None,
    ) -> None:
        self.sql_engine = sql_engine
        self.catalog_source = catalog_source or FixtureCatalogSource(catalog_path)
        self.catalog_retriever = catalog_retriever or CatalogRetriever()

    def answer(self, question: str) -> AIQueryResult:
        retrieval = self.catalog_retriever.retrieve(question, self.catalog_source.list_catalogs())
        catalog = retrieval.catalog
        context = self._context_from_catalog(catalog)
        selected_dataset = self._select_dataset(catalog, retrieval.reason_terms)
        sql = self._build_template_sql(question, context)
        validation = self.sql_engine.validate(sql, context)

        if validation.status == "succeeded":
            query_result = self.sql_engine.execute(sql, context)
            status = "succeeded"
            guardrail = validation.guardrail
        else:
            query_result = QueryResult(
                engine=self.sql_engine.health_check().engine,
                sql=sql,
                columns=[],
                rows=[],
                row_count=0,
                duration_ms=0,
            )
            status = "blocked"
            guardrail = validation.guardrail

        evidence = self._evidence_from_catalog(catalog)
        chart_spec = self._chart_spec(question)

        return AIQueryResult(
            tenant_id=catalog["tenant_id"],
            question=question,
            selected_datasets=[selected_dataset],
            evidence=evidence,
            status=status,
            sql=query_result.sql,
            query_result=query_result,
            rows=query_result.rows,
            summary=self._summary(question, query_result, guardrail),
            chart_spec=chart_spec,
            guardrail=guardrail,
            executed_at=now_iso(),
        )

    def _context_from_catalog(self, catalog: dict[str, Any]) -> SqlEngineContext:
        fields = catalog["schema"]["fields"]
        return SqlEngineContext(
            table_name=catalog["query"]["table_name"],
            allowed_columns=catalog["query"]["allowed_columns"],
            default_limit=catalog["query"].get("default_limit", 100),
            timeout_seconds=catalog["query"].get("timeout_seconds", 30),
            column_types={field["name"]: field["type"] for field in fields},
        )

    def _select_dataset(self, catalog: dict[str, Any], reason_terms: list[str]) -> SelectedDataset:
        reason = f"CatalogMetadata exposes {', '.join(reason_terms)} for the requested review analysis."
        return SelectedDataset(
            dataset_id=catalog["dataset_id"],
            name=catalog["name"],
            reason=reason,
        )

    def _build_template_sql(self, question: str, context: SqlEngineContext) -> str:
        normalized = question.lower()
        if "평점" in normalized or "별점" in normalized or "rating" in normalized:
            return (
                f"SELECT product_id, average_rating, review_count "
                f"FROM {context.table_name} "
                "ORDER BY average_rating DESC LIMIT 10"
            )

        return (
            f"SELECT product_id, review_count, average_rating "
            f"FROM {context.table_name} "
            "ORDER BY review_count DESC LIMIT 10"
        )

    def _evidence_from_catalog(self, catalog: dict[str, Any]) -> list[QueryEvidence]:
        lineage = catalog.get("lineage", {})
        return [
            QueryEvidence(
                dataset_id=catalog["dataset_id"],
                run_id=lineage.get("run_id"),
                s3_uri=catalog.get("s3_uri"),
                freshness=catalog.get("updated_at"),
            )
        ]

    def _chart_spec(self, question: str) -> ChartSpec:
        normalized = question.lower()
        if "평점" in normalized or "별점" in normalized or "rating" in normalized:
            return ChartSpec(
                type="bar",
                x="product_id",
                y="average_rating",
                title="Top products by average rating",
            )

        return ChartSpec(
            type="bar",
            x="product_id",
            y="review_count",
            title="Top products by review count",
        )

    def _summary(self, question: str, query_result: QueryResult, guardrail: GuardrailResult) -> str:
        if guardrail.validation_status != "passed":
            return f"질문을 SQL로 실행하지 못했습니다: {guardrail.failure_message}"

        if not query_result.rows:
            return "SQL은 통과했지만 반환된 row가 없습니다."

        first_row = query_result.rows[0]
        if "average_rating" in first_row and ("평점" in question or "별점" in question or "rating" in question.lower()):
            return f"{first_row.get('product_id')} 상품이 평균 평점 {first_row.get('average_rating')}로 가장 높습니다."

        return f"{first_row.get('product_id')} 상품이 리뷰 {first_row.get('review_count')}개로 가장 많습니다."
