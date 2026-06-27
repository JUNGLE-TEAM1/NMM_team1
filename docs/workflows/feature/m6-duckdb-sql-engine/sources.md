# M6 DuckDB SQL engine source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/m6-sql-context`

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `feature/m6-sql-context` | `docs/workflows/feature/m6-sql-context` | `32f2ece` | 2026-06-27 | PR #193 merged into `origin/main`; report identifies DuckDB adapter as next context. |

## Integration Notes / 통합 메모

- This is not an integration branch. It builds on PR #193 output from `origin/main`.
- Source of Truth used: `docs/03-interface-reference.md`, `docs/project-context/asklake-week2-module-plan/README.md`, `docs/project-context/asklake-week2-module-plan/decisions.md`.
