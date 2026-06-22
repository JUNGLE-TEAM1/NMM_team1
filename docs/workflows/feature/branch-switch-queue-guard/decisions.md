# Branch switch and queue guard 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- No option brief needed; requested harness guard is low risk and read-only.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Branch queue script split | Add `scripts/list-active-branches.sh` instead of expanding `status-workflow.sh` | `status-workflow.sh` is for one workspace; branch queue is cross-branch and should stay read-only | User requested on 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Automatic cleanup | Not implemented | Branch deletion changes local/remote state and needs explicit human approval | Revisit when cleanup policy is requested |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Branch queue script split | Queue output becomes too noisy | Add flags or filtering without changing cleanup safety |
