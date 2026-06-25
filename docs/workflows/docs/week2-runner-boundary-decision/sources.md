# Week2 runner boundary decision source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/docs/week2-m3-json-main-path-decision`
- `docs/workflows/docs/week2-existing-implementation-anchor`
- current M5 runner code

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
| `docs/week2-m3-json-main-path-decision` | `docs/workflows/docs/week2-m3-json-main-path-decision` | `a8fa6a2` | 2026-06-25 | M3 JSON main path and PR #105 selective recovery merged |
| `docs/week2-existing-implementation-anchor` | `docs/workflows/docs/week2-existing-implementation-anchor` | `6b7abd9` | 2026-06-25 | Existing implementation anchors protected |
| current M5 runner code | `backend/app/services/week2_local_runner.py`, `backend/app/services/week2_workflow.py` | `a8fa6a2` | 2026-06-25 | Read current `Week2RunnerResult` and workflow selection behavior |

## Integration Notes / 통합 메모

- Phase 6 is the final gating docs phase before parallel implementation begins.
