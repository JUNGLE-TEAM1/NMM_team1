# Week2 M3 JSON main path decision source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/docs/week2-main-e2e-path`
- `docs/workflows/docs/week2-existing-implementation-anchor`
- PR #105 / `origin/codex/m3-json-recommendations`

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
| `docs/week2-main-e2e-path` | `docs/workflows/docs/week2-main-e2e-path` | `400bc00` | 2026-06-25 | Main E2E path fixed to Amazon Reviews JSON |
| `docs/week2-existing-implementation-anchor` | `docs/workflows/docs/week2-existing-implementation-anchor` | `6b7abd9` | 2026-06-25 | Existing implementation anchors protected |
| `origin/codex/m3-json-recommendations` | PR #105 | remote branch / closed PR | 2026-06-25 | Read-only source material inspection |

## Integration Notes / 통합 메모

- PR #105 is not integrated in this phase.
