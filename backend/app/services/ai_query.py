from copy import deepcopy
from pathlib import Path
from typing import Any

from app.adapters.fixture_catalog_source import FixtureCatalogSource
from app.adapters.template_llm_adapter import TemplateLLMAdapter
from app.domain.ai_query import (
    AIQueryResult,
    GuardrailResult,
    QueryEvidence,
    QueryResult,
    RetrievalTraceItem,
    SelectedDataset,
    SqlEngineContext,
)
from app.domain.llm_answer import LLMAnswerContext
from app.domain.retrieval_index import RetrievalIndexHit
from app.domain.target_contracts import now_iso
from app.ports.catalog_source import CatalogSource
from app.ports.llm_adapter import LLMAdapter
from app.ports.sql_engine import SqlEngineAdapter
from app.services.catalog_retriever import CatalogRetriever
from app.services.query_router import QueryRouter
from app.services.sql_planner import SqlPlanner


class Week2AIQueryService:
    def __init__(
        self,
        sql_engine: SqlEngineAdapter,
        catalog_source: CatalogSource | None = None,
        catalog_retriever: CatalogRetriever | None = None,
        sql_planner: SqlPlanner | None = None,
        query_router: QueryRouter | None = None,
        llm_adapter: LLMAdapter | None = None,
        catalog_path: Path | None = None,
    ) -> None:
        self.sql_engine = sql_engine
        self.catalog_source = catalog_source or FixtureCatalogSource(catalog_path)
        self.catalog_retriever = catalog_retriever or CatalogRetriever()
        self.sql_planner = sql_planner or SqlPlanner()
        self.query_router = query_router or QueryRouter()
        self.llm_adapter = llm_adapter or TemplateLLMAdapter()

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
        retrieval_trace = self._retrieval_trace_from_catalog(
            catalog=catalog,
            reason_terms=retrieval.reason_terms,
            score=retrieval.score,
            evidence_index=0,
            index_hits=retrieval.index_hits,
        )
        summary = self._blocked_summary(guardrail)
        if status == "succeeded" and guardrail.validation_status == "passed":
            summary = self.llm_adapter.generate_summary(
                LLMAnswerContext(
                    question=question,
                    route=route_decision.route,
                    intent=plan.intent,
                    status=status,
                    sql=query_result.sql,
                    query_result=query_result,
                    rows=query_result.rows,
                    evidence=evidence,
                    retrieval_trace=retrieval_trace,
                    guardrail=guardrail,
                )
            ).summary

        return AIQueryResult(
            tenant_id=catalog["tenant_id"],
            question=question,
            selected_datasets=[selected_dataset],
            evidence=evidence,
            route=route_decision.route,
            retrieval_trace=retrieval_trace,
            status=status,
            sql=query_result.sql,
            query_result=query_result,
            rows=query_result.rows,
            summary=summary,
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

    def _blocked_summary(self, guardrail: GuardrailResult) -> str:
        return f"질문을 SQL로 실행하지 못했습니다: {guardrail.failure_message}"
