from app.domain.ai_query import QueryEvidence
from app.domain.llm_answer import LLMAnswer, LLMAnswerContext, LLMHealth


class TemplateLLMAdapter:
    provider = "template"

    def generate_summary(self, context: LLMAnswerContext) -> LLMAnswer:
        evidence = context.evidence[0] if context.evidence else None
        if context.guardrail.validation_status != "passed":
            return LLMAnswer(
                summary=f"질문을 SQL로 실행하지 못했습니다: {context.guardrail.failure_message}",
                source="template",
                used_evidence_indexes=[],
            )

        if evidence is None:
            return LLMAnswer(
                summary="근거가 없어 답변을 생성하지 않았습니다.",
                source="template",
                used_evidence_indexes=[],
            )

        if context.route == "rag":
            return LLMAnswer(
                summary=self._rag_summary(evidence),
                source="template",
                used_evidence_indexes=[0],
            )

        if not context.rows:
            return LLMAnswer(
                summary="SQL은 통과했지만 반환된 row가 없습니다.",
                source="template",
                used_evidence_indexes=[0],
            )

        first_row = context.rows[0]
        product_id = first_row.get("product_id")
        answer_by_intent = {
            "top_count": f"{product_id} 상품이 리뷰 {first_row.get('review_count')}개로 가장 많습니다.",
            "top_rating": f"{product_id} 상품이 평균 평점 {first_row.get('average_rating')}로 가장 높습니다.",
            "top_risk": f"{product_id} 상품이 위험 점수 {first_row.get('risk_score')}로 가장 높습니다.",
            "top_negative_review": f"{product_id} 상품이 부정 리뷰율 {first_row.get('negative_review_rate')}로 가장 높습니다.",
            "low_conversion": f"{product_id} 상품이 전환율 {first_row.get('conversion_rate')}로 가장 낮습니다.",
            "top_late_delivery": f"{product_id} 상품이 배송 지연율 {first_row.get('late_delivery_rate')}로 가장 높습니다.",
        }
        answer = answer_by_intent.get(
            context.intent,
            f"{product_id} 상품이 선택된 지표에서 가장 우선순위가 높습니다.",
        )
        grounded = self._grounded_summary(answer, evidence)
        if context.route == "hybrid":
            grounded = f"{grounded} SQL 결과와 CatalogMetadata 근거를 함께 사용했습니다."
        return LLMAnswer(summary=grounded, source="template", used_evidence_indexes=[0])

    def health_check(self) -> LLMHealth:
        return LLMHealth(provider=self.provider, status="ok", external_calls_enabled=False)

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
