# Guardrail Scenario Audit shared docs

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/system-guardrails.md` | Scenario Audit Plan과 Mock Scenario Matrix 추가 | 시스템/협업 레이어 경계가 테스트 계획에도 반영되도록 함 | 낮음 |
| `docs/12-quality-gates.md` | Guardrail Scenario Audit tier 추가 | 매 PR CI와 수동/예약 audit의 경계를 품질 게이트에 연결 | 낮음 |

## Integration Notes / 통합 메모

- 이번 Phase는 새 CI job이나 GitHub setting을 추가하지 않는다.
- 후속 automation이 생기면 `docs/18-harness-regression-policy.md`에 fixture test 영향 여부를 다시 판단한다.

## Conflicts To Resolve / 해결할 충돌

- none
