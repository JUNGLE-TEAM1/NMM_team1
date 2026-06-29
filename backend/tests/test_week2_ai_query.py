import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from app.core.settings import Settings
from app.domain.ai_query import SqlEngineContext
from app.domain.llm_answer import LLMAnswer, LLMAnswerContext
from app.fakes.fake_sql_engine import FakeSqlEngine
from app.services.ai_query import Week2AIQueryService


class InMemoryCatalogSource:
    def __init__(self, *catalogs: dict[str, object]) -> None:
        self.catalogs = list(catalogs)

    def list_catalogs(self, tenant_id: str | None = None) -> list[dict[str, object]]:
        return self.catalogs


class RecordingSqlEngine(FakeSqlEngine):
    def __init__(self) -> None:
        self.validated_contexts: list[SqlEngineContext] = []

    def validate(self, sql: str, context: SqlEngineContext):
        self.validated_contexts.append(context)
        return super().validate(sql, context)


class FailingSqlEngine(FakeSqlEngine):
    def validate(self, sql: str, context: SqlEngineContext):
        raise AssertionError("Unsupported questions must not call the SQL engine")

    def execute(self, sql: str, context: SqlEngineContext):
        raise AssertionError("Unsupported questions must not call the SQL engine")


class RecordingLLMAdapter:
    def __init__(self, summary: str = "adapter-generated summary") -> None:
        self.summary = summary
        self.contexts: list[LLMAnswerContext] = []

    def generate_summary(self, context: LLMAnswerContext) -> LLMAnswer:
        self.contexts.append(context)
        return LLMAnswer(summary=self.summary, source="template", used_evidence_indexes=[0])


class FailingLLMAdapter:
    def generate_summary(self, context: LLMAnswerContext) -> LLMAnswer:
        raise AssertionError("Blocked answers must not call the LLM adapter")


def _review_catalog(dataset_id: str, name: str, run_id: str) -> dict[str, object]:
    return {
        "tenant_id": "tenant_demo",
        "dataset_id": dataset_id,
        "name": name,
        "s3_uri": f"s3://asklake-demo/{dataset_id}/run_id={run_id}/",
        "storage": {
            "local_fallback_path": f"/tmp/{dataset_id}/{run_id}/reviews_gold.jsonl",
        },
        "schema": {
            "fields": [
                {"name": "product_id", "type": "string", "nullable": False},
                {"name": "review_count", "type": "integer", "nullable": False},
                {"name": "average_rating", "type": "number", "nullable": True},
            ]
        },
        "lineage": {"run_id": run_id},
        "query": {
            "table_name": "reviews_gold",
            "allowed_columns": ["product_id", "review_count", "average_rating"],
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "updated_at": "2026-06-26T10:00:00+09:00",
    }


def _product_health_catalog(dataset_id: str, name: str, run_id: str) -> dict[str, object]:
    return {
        "tenant_id": "tenant_demo",
        "dataset_id": dataset_id,
        "name": name,
        "s3_uri": f"s3://asklake-demo/product_health/gold/run_id={run_id}/",
        "storage": {
            "local_fallback_path": f"/tmp/{dataset_id}/{run_id}/gold_product_health.parquet",
        },
        "schema": {
            "fields": [
                {"name": "product_id", "type": "string", "nullable": False},
                {"name": "category", "type": "string", "nullable": True},
                {"name": "product_name", "type": "string", "nullable": True},
                {"name": "risk_score", "type": "number", "nullable": False},
                {"name": "negative_review_rate", "type": "number", "nullable": True},
                {"name": "conversion_rate", "type": "number", "nullable": True},
                {"name": "late_delivery_rate", "type": "number", "nullable": True},
            ]
        },
        "lineage": {
            "pipeline_id": "pipeline_product_health_e2e",
            "run_id": run_id,
            "source_ids": [
                "source_reviews_seed",
                "source_behavior_events_seed",
                "source_delivery_trips_seed",
                "source_product_master_seed",
            ],
        },
        "query": {
            "table_name": "gold_product_health",
            "allowed_columns": [
                "product_id",
                "category",
                "product_name",
                "risk_score",
                "negative_review_rate",
                "conversion_rate",
                "late_delivery_rate",
            ],
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "updated_at": "2026-06-28T10:00:00+09:00",
    }


def make_week2_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    settings = Settings(
        metadata_url=f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}",
        result_store_path=str(Path(temp_dir.name) / "results"),
    )
    store = SQLiteMetadataStore(settings.metadata_url)
    app = create_app(store, settings)
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def test_week2_ai_query_returns_fixture_backed_ai_query_result(tmp_path: Path) -> None:
    client = TestClient(
        create_app(
            settings=Settings(
                week2_sql_engine="fake",
                result_store_path=str(tmp_path / "results"),
            )
        )
    )

    response = client.post(
        "/api/week2/ai/query",
        json={"question": "리뷰가 가장 많은 상품 알려줘"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["contract"] == "AIQueryResult"
    assert payload["producer"] == "M6"
    assert payload["consumer"] == "M1"
    assert payload["tenant_id"] == "tenant_demo"
    assert payload["selected_datasets"][0]["dataset_id"] == "dataset_reviews_gold"
    assert "review_count" in payload["selected_datasets"][0]["reason"]
    assert payload["status"] == "succeeded"
    assert payload["route"] == "sql"
    assert payload["retrieval_trace"][0] == {
        "source_type": "catalog",
        "source_id": "dataset_reviews_gold",
        "score": 6.0,
        "matched_terms": ["review_count", "product_id"],
        "evidence_index": 0,
    }
    assert any(
        item["source_type"] == "schema"
        and item["source_id"] == "dataset_reviews_gold.schema.review_count"
        for item in payload["retrieval_trace"]
    )
    assert payload["guardrail"]["validation_status"] == "passed"
    assert payload["sql"] == payload["query_result"]["sql"]
    assert payload["rows"] == payload["query_result"]["rows"]
    assert payload["query_result"]["engine"] == "fake"
    assert payload["query_result"]["columns"] == [
        {"name": "product_id", "type": "string"},
        {"name": "review_count", "type": "integer"},
        {"name": "average_rating", "type": "number"},
    ]
    assert payload["query_result"]["row_count"] == len(payload["query_result"]["rows"])
    assert payload["chart_spec"]["type"] == "bar"
    assert payload["chart_spec"]["x"] == "product_id"
    assert payload["chart_spec"]["y"] == "review_count"


def test_week2_ai_query_uses_latest_m5_catalog_after_workflow_runs() -> None:
    client = make_week2_client()

    first_run = client.post("/api/week2/workflows/pipeline_reviews_json_e2e/runs")
    second_run = client.post("/api/week2/workflows/pipeline_reviews_json_e2e/runs")
    response = client.post(
        "/api/week2/ai/query",
        json={"question": "리뷰가 가장 많은 상품 알려줘"},
    )

    assert first_run.status_code == 201
    assert second_run.status_code == 201
    assert first_run.json()["run_id"] == "run_reviews_demo_001"
    assert second_run.json()["run_id"] == "run_reviews_demo_002"
    assert response.status_code == 200
    payload = response.json()
    assert payload["selected_datasets"][0]["dataset_id"] == "dataset_reviews_gold"
    assert payload["evidence"][0]["run_id"] == "run_reviews_demo_002"
    assert payload["evidence"][0]["s3_uri"] == "s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_002/"
    assert payload["status"] == "succeeded"
    assert payload["query_result"]["engine"] == "duckdb"
    assert payload["query_result"]["rows"][0]["product_id"] == "B001"
    assert payload["query_result"]["rows"][0]["review_count"] == 2
    assert payload["query_result"]["rows"][0]["review_count"] != 42


def test_week2_ai_query_evidence_grounding_includes_catalog_schema_metrics_and_lineage() -> None:
    client = make_week2_client()

    run_response = client.post("/api/week2/workflows/pipeline_reviews_json_e2e/runs")
    catalog_response = client.get("/api/week2/catalog/dataset_reviews_gold")
    response = client.post(
        "/api/week2/ai/query",
        json={"question": "Amazon reviews에서 평점 높은 상품 알려줘"},
    )

    assert run_response.status_code == 201
    assert catalog_response.status_code == 200
    assert response.status_code == 200
    run = run_response.json()
    catalog = catalog_response.json()
    payload = response.json()
    evidence = payload["evidence"][0]

    assert payload["query_result"]["engine"] == "duckdb"
    assert payload["query_result"]["rows"][0]["product_id"] == "B003"
    assert payload["query_result"]["rows"][0]["average_rating"] == 5.0
    assert evidence["dataset_id"] == "dataset_reviews_gold"
    assert evidence["run_id"] == run["run_id"]
    assert evidence["schema_fields"] == catalog["schema"]["fields"]
    assert evidence["metrics"]["row_count"] == catalog["metrics"]["row_count"]
    assert evidence["metrics"]["bytes"] == catalog["metrics"]["bytes"]
    assert evidence["metrics"]["quality"] == catalog["metrics"]["quality"]
    assert evidence["lineage"]["pipeline_id"] == "pipeline_reviews_json_e2e"
    assert evidence["lineage"]["run_id"] == run["run_id"]
    assert evidence["lineage"]["source_ids"] == ["source_amazon_reviews_demo"]
    assert "average_rating" in evidence["retrieval_terms"]
    assert run["run_id"] in payload["summary"]
    assert f"row_count={catalog['metrics']['row_count']}" in payload["summary"]
    assert "schema=product_id, review_count, average_rating" in payload["summary"]


def test_week2_ai_query_uses_injected_catalog_source_for_evidence() -> None:
    catalog = {
        "tenant_id": "tenant_demo",
        "dataset_id": "dataset_reviews_catalog_source",
        "name": "Catalog Source Reviews Gold",
        "s3_uri": "s3://asklake-demo/catalog-source/reviews/run_id=run_catalog_source_001/",
        "storage": {
            "local_fallback_path": "/tmp/catalog-source/reviews/run_catalog_source_001/reviews_gold.jsonl",
        },
        "schema": {
            "fields": [
                {"name": "product_id", "type": "string", "nullable": False},
                {"name": "review_count", "type": "integer", "nullable": False},
                {"name": "average_rating", "type": "number", "nullable": True},
            ]
        },
        "lineage": {"run_id": "run_catalog_source_001"},
        "query": {
            "table_name": "reviews_gold",
            "allowed_columns": ["product_id", "review_count", "average_rating"],
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "updated_at": "2026-06-26T10:00:00+09:00",
    }
    service = Week2AIQueryService(
        sql_engine=FakeSqlEngine(),
        catalog_source=InMemoryCatalogSource(catalog),
    )

    result = service.answer("리뷰가 가장 많은 상품 알려줘")

    assert result.selected_datasets[0].dataset_id == "dataset_reviews_catalog_source"
    assert result.selected_datasets[0].name == "Catalog Source Reviews Gold"
    assert "review_count" in result.selected_datasets[0].reason
    assert result.evidence[0].dataset_id == "dataset_reviews_catalog_source"
    assert result.evidence[0].run_id == "run_catalog_source_001"
    assert result.evidence[0].s3_uri == "s3://asklake-demo/catalog-source/reviews/run_id=run_catalog_source_001/"
    assert result.evidence[0].freshness == "2026-06-26T10:00:00+09:00"
    assert result.status == "succeeded"
    assert result.query_result.sql == result.sql
    assert result.query_result.rows == result.rows


def test_week2_ai_query_passes_catalog_local_fallback_path_to_sql_context() -> None:
    catalog = _review_catalog(
        "dataset_reviews_with_path",
        "Reviews With Path",
        "run_reviews_with_path_001",
    )
    sql_engine = RecordingSqlEngine()
    service = Week2AIQueryService(
        sql_engine=sql_engine,
        catalog_source=InMemoryCatalogSource(catalog),
    )

    result = service.answer("리뷰가 가장 많은 상품 알려줘")

    assert result.status == "succeeded"
    assert sql_engine.validated_contexts
    assert (
        sql_engine.validated_contexts[0].local_fallback_path
        == "/tmp/dataset_reviews_with_path/run_reviews_with_path_001/reviews_gold.jsonl"
    )


def test_week2_ai_query_uses_llm_adapter_for_successful_answer_context() -> None:
    catalog = _review_catalog(
        "dataset_reviews_with_path",
        "Reviews With Path",
        "run_reviews_with_path_001",
    )
    llm_adapter = RecordingLLMAdapter()
    service = Week2AIQueryService(
        sql_engine=FakeSqlEngine(),
        catalog_source=InMemoryCatalogSource(catalog),
        llm_adapter=llm_adapter,
    )

    result = service.answer("리뷰가 가장 많은 상품 알려줘")

    assert result.status == "succeeded"
    assert result.summary == "adapter-generated summary"
    assert len(llm_adapter.contexts) == 1
    context = llm_adapter.contexts[0]
    assert context.question == "리뷰가 가장 많은 상품 알려줘"
    assert context.route == "sql"
    assert context.intent == "top_count"
    assert context.sql == result.sql
    assert context.rows == result.rows
    assert context.evidence[0].dataset_id == "dataset_reviews_with_path"
    assert context.retrieval_trace[0].source_id == "dataset_reviews_with_path"


def test_week2_ai_query_does_not_send_local_path_to_llm_adapter_context() -> None:
    catalog = _review_catalog(
        "dataset_reviews_with_path",
        "Reviews With Path",
        "run_reviews_with_path_001",
    )
    llm_adapter = RecordingLLMAdapter()
    service = Week2AIQueryService(
        sql_engine=FakeSqlEngine(),
        catalog_source=InMemoryCatalogSource(catalog),
        llm_adapter=llm_adapter,
    )

    service.answer("리뷰가 가장 많은 상품 알려줘")

    context_json = llm_adapter.contexts[0].model_dump_json()
    assert "local_fallback_path" not in context_json
    assert "/tmp/dataset_reviews_with_path" not in context_json
    assert "reviews_gold.jsonl" not in context_json


def test_week2_ai_query_skips_llm_adapter_when_sql_route_is_blocked() -> None:
    catalog = _review_catalog(
        "dataset_reviews_without_path",
        "Reviews Without Path",
        "run_reviews_without_path_001",
    )
    catalog["storage"] = {}
    service = Week2AIQueryService(
        sql_engine=FakeSqlEngine(),
        catalog_source=InMemoryCatalogSource(catalog),
        llm_adapter=FailingLLMAdapter(),
    )

    result = service.answer("리뷰가 가장 많은 상품 알려줘")

    assert result.status == "blocked"
    assert result.guardrail.failure_code == "local_path_missing"


def test_week2_ai_query_skips_llm_adapter_when_question_is_unsupported() -> None:
    catalog = _review_catalog(
        "dataset_reviews_with_path",
        "Reviews With Path",
        "run_reviews_with_path_001",
    )
    service = Week2AIQueryService(
        sql_engine=FailingSqlEngine(),
        catalog_source=InMemoryCatalogSource(catalog),
        llm_adapter=FailingLLMAdapter(),
    )

    result = service.answer("내일 매출을 예측해줘")

    assert result.status == "blocked"
    assert result.route == "unsupported"


def test_week2_ai_query_blocks_when_catalog_local_fallback_path_is_missing() -> None:
    catalog = _review_catalog(
        "dataset_reviews_without_path",
        "Reviews Without Path",
        "run_reviews_without_path_001",
    )
    catalog["storage"] = {}
    service = Week2AIQueryService(
        sql_engine=FakeSqlEngine(),
        catalog_source=InMemoryCatalogSource(catalog),
    )

    result = service.answer("리뷰가 가장 많은 상품 알려줘")

    assert result.status == "blocked"
    assert result.route == "sql"
    assert result.guardrail.validation_status == "blocked"
    assert result.guardrail.failure_code == "local_path_missing"
    assert result.query_result.rows == []
    assert "local_fallback_path" in result.summary


def test_week2_ai_query_blocks_unsupported_question_without_sql_engine_call() -> None:
    catalog = _review_catalog(
        "dataset_reviews_with_path",
        "Reviews With Path",
        "run_reviews_with_path_001",
    )
    service = Week2AIQueryService(
        sql_engine=FailingSqlEngine(),
        catalog_source=InMemoryCatalogSource(catalog),
    )

    result = service.answer("내일 매출을 예측해줘")

    assert result.status == "blocked"
    assert result.route == "unsupported"
    assert result.sql == ""
    assert result.query_result.sql == ""
    assert result.query_result.rows == []
    assert result.guardrail.validation_status == "blocked"
    assert result.guardrail.failure_code == "unsupported_question"
    assert "지원하지 않는 질문" in result.summary


def test_week2_ai_query_scores_catalog_metadata_terms_when_columns_tie() -> None:
    generic_catalog = _review_catalog(
        "dataset_generic_product_metrics",
        "Generic Product Metrics",
        "run_generic_001",
    )
    amazon_catalog = _review_catalog(
        "dataset_amazon_reviews_gold",
        "Amazon Reviews Gold",
        "run_amazon_reviews_001",
    )
    service = Week2AIQueryService(
        sql_engine=FakeSqlEngine(),
        catalog_source=InMemoryCatalogSource(generic_catalog, amazon_catalog),
    )

    result = service.answer("Amazon reviews에서 평점 높은 상품 알려줘")

    assert result.selected_datasets[0].dataset_id == "dataset_amazon_reviews_gold"
    assert result.evidence[0].dataset_id == "dataset_amazon_reviews_gold"
    assert result.evidence[0].run_id == "run_amazon_reviews_001"
    assert "amazon" in result.selected_datasets[0].reason.lower()
    assert "average_rating" in result.selected_datasets[0].reason


def test_week2_ai_query_selects_product_health_catalog_for_risk_question() -> None:
    reviews_catalog = _review_catalog(
        "dataset_reviews_gold",
        "Amazon Reviews Gold",
        "run_reviews_001",
    )
    product_health_catalog = _product_health_catalog(
        "dataset_product_health_gold",
        "Product Health Gold",
        "run_product_health_001",
    )
    service = Week2AIQueryService(
        sql_engine=FakeSqlEngine(),
        catalog_source=InMemoryCatalogSource(reviews_catalog, product_health_catalog),
    )

    result = service.answer("위험 점수가 높은 상품 알려줘")

    assert result.selected_datasets[0].dataset_id == "dataset_product_health_gold"
    assert result.route == "sql"
    assert result.retrieval_trace[0].source_type == "catalog"
    assert result.retrieval_trace[0].source_id == "dataset_product_health_gold"
    assert result.retrieval_trace[0].score == 6
    assert result.retrieval_trace[0].matched_terms == ["product_id", "risk_score"]
    assert result.retrieval_trace[0].evidence_index == 0
    assert result.evidence[0].dataset_id == "dataset_product_health_gold"
    assert result.evidence[0].lineage["pipeline_id"] == "pipeline_product_health_e2e"
    assert "risk_score" in result.selected_datasets[0].reason
    assert result.sql == (
        "SELECT product_id, risk_score, category, product_name, negative_review_rate, "
        "conversion_rate, late_delivery_rate FROM gold_product_health "
        "ORDER BY risk_score DESC LIMIT 10"
    )
    assert result.chart_spec.y == "risk_score"
    assert result.rows[0]["risk_score"] == 0.92
    assert "위험 점수 0.92" in result.summary


def test_week2_ai_query_uses_hybrid_route_when_sql_question_asks_for_evidence() -> None:
    reviews_catalog = _review_catalog(
        "dataset_reviews_gold",
        "Amazon Reviews Gold",
        "run_reviews_001",
    )
    product_health_catalog = _product_health_catalog(
        "dataset_product_health_gold",
        "Product Health Gold",
        "run_product_health_001",
    )
    service = Week2AIQueryService(
        sql_engine=FakeSqlEngine(),
        catalog_source=InMemoryCatalogSource(reviews_catalog, product_health_catalog),
    )

    result = service.answer("위험 점수가 높은 상품과 그 근거를 설명해줘")

    assert result.status == "succeeded"
    assert result.route == "hybrid"
    assert result.sql
    assert result.rows[0]["risk_score"] == 0.92
    assert "SQL 결과와 CatalogMetadata 근거" in result.summary
    assert any(
        item.source_type == "schema"
        and item.source_id == "dataset_product_health_gold.schema.risk_score"
        for item in result.retrieval_trace
    )


def test_week2_ai_query_uses_rag_route_for_metadata_question_without_sql_engine_call() -> None:
    product_health_catalog = _product_health_catalog(
        "dataset_product_health_gold",
        "Product Health Gold",
        "run_product_health_001",
    )
    service = Week2AIQueryService(
        sql_engine=FailingSqlEngine(),
        catalog_source=InMemoryCatalogSource(product_health_catalog),
    )

    result = service.answer("이 데이터셋의 스키마와 lineage 근거를 알려줘")

    assert result.status == "succeeded"
    assert result.route == "rag"
    assert result.sql == ""
    assert result.query_result.sql == ""
    assert result.query_result.rows == []
    assert result.guardrail.validation_status == "passed"
    assert "CatalogMetadata 근거" in result.summary
    assert "schema=product_id, category, product_name, risk_score" in result.summary
    assert any(item.source_type == "lineage" for item in result.retrieval_trace)


def test_week2_ai_query_retrieval_trace_includes_catalog_rag_index_chunks() -> None:
    reviews_catalog = _review_catalog(
        "dataset_reviews_gold",
        "Amazon Reviews Gold",
        "run_reviews_001",
    )
    product_health_catalog = _product_health_catalog(
        "dataset_product_health_gold",
        "Product Health Gold",
        "run_product_health_001",
    )
    service = Week2AIQueryService(
        sql_engine=FakeSqlEngine(),
        catalog_source=InMemoryCatalogSource(reviews_catalog, product_health_catalog),
    )

    result = service.answer("위험 점수가 높은 상품 알려줘")

    assert result.route == "sql"
    assert result.retrieval_trace[0].source_type == "catalog"
    assert result.retrieval_trace[0].source_id == "dataset_product_health_gold"
    assert any(
        item.source_type == "schema"
        and item.source_id == "dataset_product_health_gold.schema.risk_score"
        and item.evidence_index == 0
        for item in result.retrieval_trace
    )


def test_fake_sql_engine_blocks_non_select_sql() -> None:
    context = SqlEngineContext(
        table_name="reviews_gold",
        allowed_columns=["product_id", "review_count"],
        default_limit=10,
        timeout_seconds=30,
    )

    validation = FakeSqlEngine().validate("DELETE FROM reviews_gold", context)

    assert validation.status == "blocked"
    assert validation.failure_code == "non_select_sql"


def test_fake_sql_engine_blocks_unallowed_table_and_missing_limit() -> None:
    context = SqlEngineContext(
        table_name="reviews_gold",
        allowed_columns=["product_id", "review_count"],
        default_limit=10,
        timeout_seconds=30,
    )
    engine = FakeSqlEngine()

    table_validation = engine.validate("SELECT product_id FROM private_table LIMIT 10", context)
    limit_validation = engine.validate("SELECT product_id FROM reviews_gold", context)

    assert table_validation.status == "blocked"
    assert table_validation.failure_code == "table_not_allowed"
    assert limit_validation.status == "blocked"
    assert limit_validation.failure_code == "limit_required"


def test_fake_sql_engine_blocks_unallowed_column() -> None:
    context = SqlEngineContext(
        table_name="reviews_gold",
        allowed_columns=["product_id", "review_count"],
        default_limit=10,
        timeout_seconds=30,
    )

    validation = FakeSqlEngine().validate("SELECT secret_note FROM reviews_gold LIMIT 10", context)

    assert validation.status == "blocked"
    assert validation.failure_code == "column_not_allowed"


def test_fake_sql_engine_blocks_valid_sql_when_local_fallback_path_is_missing() -> None:
    context = SqlEngineContext(
        table_name="reviews_gold",
        allowed_columns=["product_id", "review_count"],
        default_limit=10,
        timeout_seconds=30,
    )

    validation = FakeSqlEngine().validate("SELECT product_id FROM reviews_gold LIMIT 10", context)

    assert validation.status == "blocked"
    assert validation.failure_code == "local_path_missing"
