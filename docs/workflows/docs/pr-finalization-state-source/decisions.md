# PR finalization state source 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Decision Option Brief not needed. The change narrows an observed harness status bug without product/runtime tradeoffs.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Post-merge status source | Use GitHub PR/issue state when available | `sync.md` final fields can be stale after merge because local finalization happens too late to enter the merged PR | user prompt / 2026-06-24 |
| Historical workspace handling | Do not mass-edit past workspaces | Avoid evidence churn; scripts should interpret stale local fields safely | user prompt / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| GitHub unavailable fallback | `gh` unavailable or unauthenticated | Fall back to `sync.md` and display remote status unavailable |
