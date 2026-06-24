# Trust State Model 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 고영향 provider 결정은 발생하지 않음. 실제 PII/policy/secret provider 도입은 이번 Phase 범위에서 제외.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Trust 상태 저장 방식 | baseline `status`와 별도 `trust_status`/`trust_gate_result` 추가 | 기존 current baseline 회귀를 피하면서 Target MVP 상태 모델을 시작하기 위함 | 사용자 지시와 Phase 범위, 2026-06-24 |
| Trust gate 계산 | deterministic placeholder | 실제 PII/policy 엔진 없이 R1 계약과 UI evidence를 먼저 확인하기 위함 | 사용자 지시와 handoff boundary, 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 실제 PII 탐지 | 고비용/고복잡도이며 이번 Phase mock/fake boundary 밖 | Trust gate placeholder가 실제 데이터 보호 요구를 막기 시작할 때 | 별도 Quality / PII Phase |
| 실제 policy engine | Query / Policy workstream 계약과 함께 결정 필요 | `feature/query-policy-preflight`에서 mock boundary를 넘으려 할 때 | `feature/query-policy-preflight` |
| Query/Ask 차단 로직 | 이번 Phase는 Catalog / Trust owner scope | Query 또는 Ask가 `trust_status`를 소비하기 시작할 때 | Query / Policy 또는 Ask / Evidence Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 별도 `trust_status` 유지 | baseline `status`와 Target 상태가 혼동되거나 중복 update bug가 발생 | migration 또는 unified state design을 별도 Decision Option Brief로 재검토 |
