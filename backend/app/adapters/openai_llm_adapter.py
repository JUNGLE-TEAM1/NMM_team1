import json
from typing import Any, Callable
from urllib import request as urllib_request

from app.adapters.template_llm_adapter import TemplateLLMAdapter
from app.domain.llm_answer import LLMAnswer, LLMAnswerContext, LLMHealth

HttpPost = Callable[[str, dict[str, str], dict[str, Any], int], dict[str, Any]]


class OpenAILLMAdapter:
    provider = "openai"

    def __init__(
        self,
        api_key: str | None,
        model: str = "gpt-4.1-mini",
        base_url: str = "https://api.openai.com/v1",
        timeout_seconds: int = 30,
        fallback_adapter: TemplateLLMAdapter | None = None,
        http_post: HttpPost | None = None,
    ) -> None:
        self.api_key = (api_key or "").strip()
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds
        self.fallback_adapter = fallback_adapter or TemplateLLMAdapter()
        self.http_post = http_post or self._post_json

    def generate_summary(self, context: LLMAnswerContext) -> LLMAnswer:
        if not self.api_key:
            return self._fallback_answer(context, "no_api_key")

        try:
            response = self.http_post(
                f"{self.base_url}/responses",
                self._headers(),
                self._request_body(context),
                self.timeout_seconds,
            )
            summary = self._extract_output_text(response)
        except Exception:
            return self._fallback_answer(context, "provider_error")

        if not summary:
            return self._fallback_answer(context, "empty_output")

        return LLMAnswer(
            summary=summary,
            source="external",
            provider=self.provider,
            used_evidence_indexes=self._used_evidence_indexes(context),
        )

    def health_check(self) -> LLMHealth:
        return LLMHealth(
            provider=self.provider,
            status="ok" if self.api_key else "unavailable",
            external_calls_enabled=bool(self.api_key),
        )

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _request_body(self, context: LLMAnswerContext) -> dict[str, Any]:
        return {
            "model": self.model,
            "input": [
                {
                    "role": "system",
                    "content": (
                        "You are the M6 answer generator for AskLake. Answer in Korean. "
                        "Use only the provided SQL rows, evidence, and retrieval trace. "
                        "If the provided material is insufficient, say that evidence is insufficient. "
                        "Do not mention hidden files, local paths, credentials, or unsupported columns."
                    ),
                },
                {
                    "role": "user",
                    "content": json.dumps(self._safe_context(context), ensure_ascii=False),
                },
            ],
        }

    def _safe_context(self, context: LLMAnswerContext) -> dict[str, Any]:
        return {
            "question": context.question,
            "route": context.route,
            "intent": context.intent,
            "status": context.status,
            "sql": context.sql,
            "query_result": {
                "engine": context.query_result.engine,
                "sql": context.query_result.sql,
                "columns": [
                    column.model_dump(mode="json")
                    for column in context.query_result.columns
                ],
                "rows": context.rows[:20],
                "row_count": context.query_result.row_count,
                "duration_ms": context.query_result.duration_ms,
            },
            "evidence": [
                evidence.model_dump(mode="json", exclude_none=True, exclude={"storage"})
                for evidence in context.evidence[:5]
            ],
            "retrieval_trace": [
                trace.model_dump(mode="json", exclude_none=True)
                for trace in context.retrieval_trace[:20]
            ],
            "guardrail": context.guardrail.model_dump(mode="json", exclude_none=True),
        }

    def _extract_output_text(self, response: dict[str, Any]) -> str:
        output_text = response.get("output_text")
        if isinstance(output_text, str) and output_text.strip():
            return output_text.strip()

        output_items = response.get("output")
        if not isinstance(output_items, list):
            return ""

        for output_item in output_items:
            if not isinstance(output_item, dict):
                continue
            content_items = output_item.get("content")
            if not isinstance(content_items, list):
                continue
            for content_item in content_items:
                if not isinstance(content_item, dict):
                    continue
                text = content_item.get("text") or content_item.get("output_text")
                if isinstance(text, str) and text.strip():
                    return text.strip()
        return ""

    def _used_evidence_indexes(self, context: LLMAnswerContext) -> list[int]:
        indexes = {
            trace.evidence_index
            for trace in context.retrieval_trace
            if trace.evidence_index is not None
        }
        if indexes:
            return sorted(indexes)
        if context.evidence:
            return [0]
        return []

    def _fallback_answer(self, context: LLMAnswerContext, reason: str) -> LLMAnswer:
        answer = self.fallback_adapter.generate_summary(context)
        return answer.model_copy(
            update={
                "provider": self.provider,
                "fallback_used": True,
                "fallback_reason": reason,
            }
        )

    def _post_json(
        self,
        url: str,
        headers: dict[str, str],
        body: dict[str, Any],
        timeout_seconds: int,
    ) -> dict[str, Any]:
        payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
        request = urllib_request.Request(url, data=payload, headers=headers, method="POST")
        with urllib_request.urlopen(request, timeout=timeout_seconds) as response:
            response_body = response.read().decode("utf-8")
        parsed = json.loads(response_body)
        if isinstance(parsed, dict):
            return parsed
        return {}
