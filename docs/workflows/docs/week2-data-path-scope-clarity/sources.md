# Week2 data path scope clarity source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- not an integration workspace

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
| `origin/main` | n/a | `e11ff8b` | 2026-06-26 | branch created from latest main at start |

## Integration Notes / 통합 메모

- Related prior ver2 reports: `week2-main-e2e-path.md`, `week2-m3-json-main-path-decision.md`, `week2-runner-boundary-decision.md`, `week2-team-handoff-summary.md`.
