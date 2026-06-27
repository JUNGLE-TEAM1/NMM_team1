# M5 demo cockpit UI source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/m5-airflow-smoke-integration`
- `docs/workflows/feature/m1-run-status-live-ui`

## Required Source Files / 읽어야 할 source 파일

- `docs/workflows/feature/m5-airflow-smoke-integration/report.md`
- `docs/workflows/feature/m5-airflow-smoke-integration/quality.md`
- `docs/workflows/feature/m5-airflow-smoke-integration/decisions.md`
- `docs/reports/m1-run-status-live-ui.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`

## Source Branch Base Records / source branch 기준 기록

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `feature/m5-airflow-smoke-integration` | `docs/workflows/feature/m5-airflow-smoke-integration` | `8812690` | 2026-06-27 | current branch/worktree source |
| `feature/m1-run-status-live-ui` | historical report | not checked | 2026-06-27 | confirms `/etl` already consumed M5 run API |

## Integration Notes / 통합 메모

- 이 UI는 M5 Airflow smoke branch의 adapter/result artifact evidence와 M1 Run Status Live UI의 `/etl` surface를 이어받는다.
- 후속 PR 분리 시 source workspace references를 PR description에 요약한다.
