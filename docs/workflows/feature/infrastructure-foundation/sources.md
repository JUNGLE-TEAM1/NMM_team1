# Infrastructure foundation source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/mvp-roadmap`

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
| feature/mvp-roadmap | `docs/workflows/feature/mvp-roadmap` | ef6e527 | 2026-06-22 | roadmap context carried into dirty worktree branch |

## Integration Notes / 통합 메모

- 이 branch는 `feature/mvp-roadmap`의 인프라 선행 결정에 이어서 생성되었다.
