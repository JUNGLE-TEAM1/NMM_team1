from copy import deepcopy
from pathlib import Path
from typing import Any

from app.adapters.fixture_catalog_source import FixtureCatalogSource
from app.domain.ai_query import (
    AIQueryResult,
    GuardrailResult,
    QueryEvidence,
    QueryResult,
    RetrievalTraceItem,
    SelectedDataset,
    SqlEngineContext,
)
from app.domain.retrieval_index import RetrievalIndexHit
from app.domain.target_contracts import now_iso
from app.ports.catalog_source import CatalogSource
from app.ports.sql_engine import SqlEngineAdapter
from app.services.catalog_retriever import CatalogRetriever
from app.services.query_router import QueryRouteDecision, QueryRouter
from app.services.sql_planner import SqlPlan, SqlPlanner


class Week2AIQueryService:
    def __init__(
        self,
        sql_engine: SqlEngineAdapter,
        catalog_source: CatalogSource | None = None,
        catalog_retriever: CatalogRetriever | None = None,
        sql_planner: SqlPlanner | None = None,
        query_router: QueryRouter | None = None,
        catalog_path: Path | None = None,
    ) -> None:
        self.sql_engine = sql_engine
        self.catalog_source = catalog_source or FixtureCatalogSource(catalog_path)
        self.catalog_retriever = catalog_retriever or CatalogRetriever()
        self.sql_planner = sql_planner or SqlPlanner()
        self.query_router = query_router or QueryRouter()

    def answer(self, question: str) -> AIQueryResult:
        retrieval = self.catalog_retriever.retrieve(question, self.catalog_source.list_catalogs())
        catalog = retrieval.catalog
        context = self._context_from_catalog(catalog)
        selected_dataset = self._select_dataset(catalog, retrieval.reason_terms)
        plan = self.sql_planner.plan(question, context)
        route_decision = self.query_router.decide(question, plan)

        if route_decision.route == "unsupported":
            query_result = QueryResult(
                engine=self.sql_engine.health_check().engine,
                sql=plan.sql,
                columns=[],
                rows=[],
                row_count=0,
                duration_ms=0,
            )
            status = "blocked"
            guardrail = GuardrailResult(
                validation_status="blocked",
                failure_code=route_decision.failure_code,
                failure_message=route_decision.failure_message,
            )
        elif route_decision.requires_sql:
            validation = self.sql_engine.validate(plan.sql, context)
            if validation.status == "succeeded":
                query_result = self.sql_engine.execute(plan.sql, context)
                status = "succeeded"
                guardrail = validation.guardrail
            else:
                query_result = QueryResult(
                    engine=self.sql_engine.health_check().engine,
                    sql=plan.sql,
                    columns=[],
                    rows=[],
                    row_count=0,
                    duration_ms=0,
                )
                status = "blocked"
                guardrail = validation.guardrail
        else:
            query_result = QueryResult(
                engine=self.sql_engine.health_check().engine,
                sql="",
                columns=[],
                rows=[],
                row_count=0,
                duration_ms=0,
            )
            status = "succeeded"
            guardrail = GuardrailResult(validation_status="passed")

        evidence = self._evidence_from_catalog(
            catalog,
            self._merged_terms(retrieval.reason_terms, route_decision.reason_terms),
        )

        return AIQueryResult(
            tenant_id=catalog["tenant_id"],
            question=question,
            selected_datasets=[selected_dataset],
            evidence=evidence,
            route=route_decision.route,
            retrieval_trace=self._retrieval_trace_from_catalog(
                catalog=catalog,
                reason_terms=retrieval.reason_terms,
                score=retrieval.score,
                evidence_index=0,
                index_hits=retrieval.index_hits,
            ),
            status=status,
            sql=query_result.sql,
            query_result=query_result,
            rows=query_result.rows,
            summary=self._summary(plan, query_result, guardrail, evidence[0], route_decision),
            chart_spec=plan.chart_spec,
            guardrail=guardrail,
            executed_at=now_iso(),
        )

    def _context_from_catalog(self, catalog: dict[str, Any]) -> SqlEngineContext:
        fields = catalog["schema"]["fields"]
        storage = catalog.get("storage", {})
        return SqlEngineContext(
            table_name=catalog["query"]["table_name"],
            allowed_columns=catalog["query"]["allowed_columns"],
            local_fallback_path=storage.get("local_fallback_path"),
            default_limit=catalog["query"].get("default_limit", 100),
            timeout_seconds=catalog["query"].get("timeout_seconds", 30),
            column_types={field["name"]: field["type"] for field in fields},
        )

    def _select_dataset(self, catalog: dict[str, Any], reason_terms: list[str]) -> SelectedDataset:
        reason = f"CatalogMetadata exposes {', '.join(reason_terms)} for the requested analysis."
        return SelectedDataset(
            dataset_id=catalog["dataset_id"],
            name=catalog["name"],
            reason=reason,
        )

    def _evidence_from_catalog(self, catalog: dict[str, Any], reason_terms: list[str]) -> list[QueryEvidence]:
        lineage = catalog.get("lineage", {})
        metrics = catalog.get("metrics", {})
        query = catalog.get("query", {})
        return [
            QueryEvidence(
                dataset_id=catalog["dataset_id"],
                run_id=lineage.get("run_id"),
                s3_uri=catalog.get("s3_uri"),
                freshness=catalog.get("updated_at"),
                table_name=query.get("table_name"),
                schema_fields=deepcopy(catalog.get("schema", {}).get("fields", [])),
                metrics=deepcopy(
                    {
                        "row_count": metrics.get("row_count"),
                        "bytes": metrics.get("bytes"),
                        "quality": metrics.get("quality", {}),
                        "semantics": metrics.get("semantics", {}),
                    }
                ),
                lineage=deepcopy(lineage),
                retrieval_terms=list(reason_terms),
            )
        ]

    def _merged_terms(self, *term_groups: list[str]) -> list[str]:
        terms: list[str] = []
        for term_group in term_groups:
            for term in term_group:
                if term not in terms:
                    terms.append(term)
        return terms

    def _retrieval_trace_from_catalog(
        self,
        catalog: dict[str, Any],
        reason_terms: list[str],
        score: int | float,
        evidence_index: int,
        index_hits: list[RetrievalIndexHit] | None = None,
    ) -> list[RetrievalTraceItem]:
        trace = [
            RetrievalTraceItem(
                source_type="catalog",
                source_id=catalog["dataset_id"],
                score=float(score),
                matched_terms=list(reason_terms),
                evidence_index=evidence_index,
            )
        ]
        for hit in index_hits or []:
            if hit.source_type == "catalog" and hit.source_id == catalog["dataset_id"]:
                continue
            trace.append(
                RetrievalTraceItem(
                    source_type=hit.source_type,
                    source_id=hit.source_id,
                    score=hit.score,
                    matched_terms=hit.matched_terms,
                    evidence_index=evidence_index,
                )
            )
        return trace

    def _summary(
        self,
        plan: SqlPlan,
        query_result: QueryResult,
        guardrail: GuardrailResult,
        evidence: QueryEvidence,
        route_decision: QueryRouteDecision,
    ) -> str:
        if guardrail.validation_status != "passed":
            return f"질문을 SQL로 실행하지 못했습니다: {guardrail.failure_message}"

        if route_decision.route == "rag":
            return self._rag_summary(evidence)

        if not query_result.rows:
            return "SQL은 통과했지만 반환된 row가 없습니다."

        first_row = query_result.rows[0]
        product_id = first_row.get("product_id")
        answer_by_intent = {
            "top_count": f"{product_id} 상품이 리뷰 {first_row.get('review_count')}개로 가장 많습니다.",
            "top_rating": f"{product_id} 상품이 평균 평점 {first_row.get('average_rating')}로 가장 높습니다.",
            "top_risk": f"{product_id} 상품이 위험 점수 {first_row.get('risk_score')}로 가장 높습니다.",
            "top_negative_review": f"{product_id} 상품이 부정 리뷰율 {first_row.get('negative_review_rate')}로 가장 높습니다.",
            "low_conversion": f"{product_id} 상품이 전환율 {first_row.get('conversion_rate')}로 가장 낮습니다.",
            "top_late_delivery": f"{product_id} 상품이 배송 지연율 {first_row.get('late_delivery_rate')}로 가장 높습니다.",
        }
        answer = answer_by_intent.get(plan.intent, f"{product_id} 상품이 선택된 지표에서 가장 우선순위가 높습니다.")
        grounded = self._grounded_summary(answer, evidence)
        if route_decision.route == "hybrid":
            return f"{grounded} SQL 결과와 CatalogMetadata 근거를 함께 사용했습니다."
        return grounded

    def _rag_summary(self, evidence: QueryEvidence) -> str:
        return self._grounded_summary("CatalogMetadata 근거로 스키마, 메트릭, 라인리지를 확인했습니다.", evidence)

    def _grounded_summary(self, answer: str, evidence: QueryEvidence) -> str:
        schema_names = [
            str(field.get("name"))
            for field in evidence.schema_fields
            if field.get("name")
        ]
        evidence_parts = [f"dataset={evidence.dataset_id}"]
        if evidence.run_id:
            evidence_parts.append(f"run_id={evidence.run_id}")
        if evidence.metrics.get("row_count") is not None:
            evidence_parts.append(f"row_count={evidence.metrics['row_count']}")
        if schema_names:
            evidence_parts.append(f"schema={', '.join(schema_names)}")
        return f"{answer} 근거: {'; '.join(evidence_parts)}."
