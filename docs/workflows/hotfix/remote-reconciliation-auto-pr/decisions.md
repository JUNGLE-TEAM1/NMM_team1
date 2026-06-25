# Remote reconciliation auto PR 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Not needed. User explicitly requested applying the prompt to the harness.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Remote reconciliation auto PR | 자동 PR 대상으로 명문화 | 원격 상태 보정과 재현 하네스 변경이 분리되면 팀 문맥이 깨진다 | user / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Remote reconciliation auto PR | policy causes PRs for one-off remote-only actions without harness changes | narrow detection to require changed scripts/docs/tests and workspace evidence |
