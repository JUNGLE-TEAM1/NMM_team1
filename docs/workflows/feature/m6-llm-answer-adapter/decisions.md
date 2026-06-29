# M6 LLM Answer Adapter 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 고영향 provider 선택은 하지 않았다. 외부 LLM/provider/API key 도입은 후속 Phase에서 별도 Decision Option Brief가 필요하다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Default LLM adapter | 외부 호출 없는 `TemplateLLMAdapter` | Week 2 mock/fake boundary와 로컬 테스트 안정성을 유지하면서 future provider seam을 만든다. | Codex / 2026-06-29 |
| Blocked answer handling | blocked/unsupported는 LLM adapter를 호출하지 않음 | evidence 없는 답변이나 unsupported 질문이 provider/prompt로 넘어가는 것을 막는다. | Codex / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Real external LLM provider | API key/secret/provider prompt 정책이 별도 결정 필요 | 실제 provider를 써야 하는 demo 또는 제품 요구가 생길 때 | future M6 provider Phase |
| Trino/Athena engine | 먼저 기존 M6 plan을 완성하기로 한 현재 판단에 따름 | DuckDB 규모 한계가 실제 대표 path 병목이 될 때 | post-M6 MVP engine Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Default LLM adapter | summary 품질이 기존보다 낮아지거나 M1 display가 깨질 때 | `TemplateLLMAdapter` output mapping을 조정하고 focused M6/M1 smoke를 재실행한다. |
| Blocked answer handling | blocked인데 provider call 또는 prompt material 생성이 감지될 때 | 즉시 blocked path를 service-local summary로 되돌리고 regression을 추가한다. |
