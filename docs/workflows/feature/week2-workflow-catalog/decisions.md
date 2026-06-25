# Week 2 Workflow Catalog 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 후보 비교 없음. `docs/project-context/asklake-week2-module-plan/decisions.md`의 M5 결정과 `docs/03` Week 2 draft route contract를 적용했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Week 2 M5 runtime boundary | Additive `/api/week2` fixture-backed runtime slice | 기존 baseline `/api/pipelines`와 섞지 않고 M1/M6가 소비할 draft route contract를 빠르게 검증하기 위해 | 사용자 진행 지시, 2026-06-25 |
| Fallback status | local runner request returns `fallback_succeeded` with `ExecutionResult` shape | Airflow 실패 시 같은 `WorkflowDefinition`을 local runner로 실행한다는 Week 2 결정과 맞추기 위해 | project context accepted decision |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Actual Airflow adapter | 이번 slice는 fixture-backed contract runtime이며 실제 Airflow 환경은 아직 연결하지 않음 | Day 2 첫 실제 처리에서 Airflow Trigger/Status를 붙일 때 | M5 Workflow/Catalog follow-up |
| Catalog persistence strategy | 지금은 in-memory fixture catalog로 M1/M6 boundary만 검증 | M3 output과 Catalog 자동 등록을 연결할 때 | M5 Workflow/Catalog follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `/api/week2` draft route | M1이 baseline API adapter를 선택하거나 route contract를 바꾸는 경우 | `docs/03` Week 2 route section과 tests를 함께 갱신 |
| in-memory catalog | M5가 actual run persistence를 붙이는 경우 | SQLite metadata store 또는 별도 Week 2 store로 이동 |
