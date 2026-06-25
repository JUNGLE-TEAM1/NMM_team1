# Week2 existing implementation anchor source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/docs/week2-main-e2e-path`
- `docs/workflows/docs/week2-implementation-transition`

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
| `docs/week2-main-e2e-path` | `docs/workflows/docs/week2-main-e2e-path` | `400bc00` | 2026-06-25 | Phase 3 main E2E path merged in PR #120 |
| `docs/week2-implementation-transition` | `docs/workflows/docs/week2-implementation-transition` | `2f811be` | 2026-06-25 | Phase 2 adapter-first transition plan merged in PR #119 |

## Integration Notes / 통합 메모

- Phase 4 protects existing implementation anchors before Phase 5/6 detailed contract decisions.
