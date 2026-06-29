# M6 OpenAI LLM Adapter 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| OpenAI key handling | 코드에는 key placeholder와 env contract만 둔다 | 사용자가 실제 key는 나중에 직접 채우기로 했고, 기본 smoke는 secret 없이 돌아가야 한다 | User / 2026-06-29 |

### OpenAI key는 코드에 넣지 않고 env-gated로 둔다

- Decision: 이번 Phase는 `OpenAILLMAdapter` 코드와 환경 변수 계약만 만든다.
- Rationale: 실제 `OPENAI_API_KEY`는 사용자가 나중에 로컬 환경 변수로 채우며, repo에는 secret을 남기지 않는다.
- Impact: `OPENAI_API_KEY`가 없거나 `WEEK2_LLM_PROVIDER`가 `openai`가 아니면 외부 호출을 하지 않고 `TemplateLLMAdapter`를 사용한다.
- Owner boundary: M6 answer generation adapter만 변경하며 M1 UI, M5 Catalog, SQL planner/engine 소유권은 건드리지 않는다.

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
|  |  |  |  |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
|  |  |  |
