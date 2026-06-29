from typing import Protocol

from app.domain.llm_answer import LLMAnswer, LLMAnswerContext, LLMHealth


class LLMAdapter(Protocol):
    def generate_summary(self, context: LLMAnswerContext) -> LLMAnswer: ...

    def health_check(self) -> LLMHealth: ...
