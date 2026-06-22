# Harness flow consistency audit source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

-

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
| `main` | `docs/workflows/feature/branch-switch-queue-guard` | `dd8cf0f` | 2026-06-22 | checked stale handoff wording |
| `main` | `docs/workflows/feature/internal-step-prompt-standard` | `dd8cf0f` | 2026-06-22 | checked stale handoff wording |
| `main` | `docs/workflows/feature/completion-handoff-choice-details` | `dd8cf0f` | 2026-06-22 | checked current choice wording |

## Integration Notes / 통합 메모

- Not an integration branch; source records are audit references only.
