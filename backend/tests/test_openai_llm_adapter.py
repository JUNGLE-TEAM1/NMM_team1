import json
from typing import Any

from app.adapters.openai_llm_adapter import OpenAILLMAdapter
from app.domain.ai_query import GuardrailResult, QueryColumn, QueryEvidence, QueryResult, RetrievalTraceItem
from app.domain.llm_answer import LLMAnswerContext


def _context() -> LLMAnswerContext:
    evidence = QueryEvidence(
        dataset_id="dataset_product_health_gold",
        run_id="run_product_health_001",
        s3_uri="s3://asklake-demo/product_health/gold/run_id=run_product_health_001/",
        table_name="gold_product_health",
        storage={"local_fallback_path": "/tmp/private/gold_product_health.parquet"},
        schema_fields=[
            {"name": "internal_product_id", "type": "string", "nullable": False},
            {"name": "risk_score", "type": "number", "nullable": False},
        ],
        metrics={"row_count": 3, "quality": {"status": "passed"}},
        lineage={"pipeline_id": "pipeline_product_health_e2e"},
        retrieval_terms=["internal_product_id", "risk_score"],
    )
    return LLMAnswerContext(
        question="위험 점수가 높은 상품과 근거를 설명해줘",
        route="hybrid",
        intent="top_risk",
        status="succeeded",
        sql="SELECT internal_product_id, risk_score FROM gold_product_health ORDER BY risk_score DESC LIMIT 10",
        query_result=QueryResult(
            engine="duckdb",
            sql="SELECT internal_product_id, risk_score FROM gold_product_health ORDER BY risk_score DESC LIMIT 10",
            columns=[
                QueryColumn(name="internal_product_id", type="string"),
                QueryColumn(name="risk_score", type="number"),
            ],
            rows=[{"internal_product_id": "aph_prod_001", "risk_score": 0.92}],
            row_count=1,
            duration_ms=4,
        ),
        rows=[{"internal_product_id": "aph_prod_001", "risk_score": 0.92}],
        evidence=[evidence],
        retrieval_trace=[
            RetrievalTraceItem(
                source_type="catalog",
                source_id="dataset_product_health_gold",
                score=6.0,
                matched_terms=["internal_product_id", "risk_score"],
                evidence_index=0,
            )
        ],
        guardrail=GuardrailResult(validation_status="passed"),
    )


def test_openai_llm_adapter_builds_safe_responses_request() -> None:
    recorded: dict[str, Any] = {}

    def fake_post(
        url: str,
        headers: dict[str, str],
        body: dict[str, Any],
        timeout_seconds: int,
    ) -> dict[str, Any]:
        recorded["url"] = url
        recorded["headers"] = headers
        recorded["body"] = body
        recorded["timeout_seconds"] = timeout_seconds
        return {"output_text": "aph_prod_001 상품이 위험 점수 0.92로 가장 높습니다."}

    adapter = OpenAILLMAdapter(
        api_key="unit-test-key",
        model="unit-test-model",
        base_url="https://api.openai.test/v1",
        timeout_seconds=9,
        http_post=fake_post,
    )

    answer = adapter.generate_summary(_context())

    assert answer.summary == "aph_prod_001 상품이 위험 점수 0.92로 가장 높습니다."
    assert answer.source == "external"
    assert answer.provider == "openai"
    assert answer.fallback_used is False
    assert answer.used_evidence_indexes == [0]
    assert recorded["url"] == "https://api.openai.test/v1/responses"
    assert recorded["headers"]["Authorization"] == "Bearer unit-test-key"
    assert recorded["body"]["model"] == "unit-test-model"

    body_text = json.dumps(recorded["body"], ensure_ascii=False)
    assert "dataset_product_health_gold" in body_text
    assert "risk_score" in body_text
    assert "unit-test-key" not in body_text
    assert "OPENAI_API_KEY" not in body_text
    assert "local_fallback_path" not in body_text
    assert "/tmp" not in body_text
    assert "gold_product_health.parquet" not in body_text


def test_openai_llm_adapter_falls_back_to_template_on_provider_error() -> None:
    def failing_post(
        url: str,
        headers: dict[str, str],
        body: dict[str, Any],
        timeout_seconds: int,
    ) -> dict[str, Any]:
        raise TimeoutError("provider timeout")

    adapter = OpenAILLMAdapter(api_key="unit-test-key", http_post=failing_post)

    answer = adapter.generate_summary(_context())

    assert answer.source == "template"
    assert answer.provider == "openai"
    assert answer.fallback_used is True
    assert answer.fallback_reason == "provider_error"
    assert "위험 점수 0.92" in answer.summary


def test_openai_llm_adapter_health_requires_api_key() -> None:
    missing_key_adapter = OpenAILLMAdapter(api_key="")
    enabled_adapter = OpenAILLMAdapter(api_key="unit-test-key")

    assert missing_key_adapter.health_check().status == "unavailable"
    assert enabled_adapter.health_check().status == "ok"
