# M1 Week2 final demo flow 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M1 follow-up scope | frontend display polish only | M1은 runtime/backend 연결을 소유하지 않고, 최신 Catalog/AIQueryResult 상태를 화면에서 명확히 보여주는 역할이다. | User "진행해" / 2026-06-27 |
| #200/#204 handling | inspect but do not merge | #200 and #204 are open PRs with separate ownership; this branch avoids direct merge and large `/etl` overlap. | AI implementation / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| PR packaging | linked issue was skipped at workspace creation; #200/#204 merge order may change best handoff path | human chooses PR 진행 or #200/#204 merge completes | `feature/m1-week2-final-demo-flow` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| M1 final display polish | #200 merges and changes same `/etl`/App.jsx area | re-check conflicts and final smoke before PR |
| DuckDB runtime display | #204 response shape changes `query_result.engine` or missing-path behavior | update defensive rendering only; do not change M6 runtime |
