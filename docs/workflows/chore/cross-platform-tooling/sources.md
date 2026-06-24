# Cross-platform tooling source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/docs/cross-platform-smoke-audit/`
- `docs/workflows/docs/windows-wsl2-smoke-audit/`

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
| `docs/cross-platform-smoke-audit` | `docs/workflows/docs/cross-platform-smoke-audit` | `70244ba` | 2026-06-24 | macOS baseline과 Windows follow-up 범위를 참조 |
| `docs/windows-wsl2-smoke-audit` | `docs/workflows/docs/windows-wsl2-smoke-audit` | `70244ba` | 2026-06-24 | WSL2 direct execution handoff와 실패 요인을 참조 |

## Integration Notes / 통합 메모

- source workspace 외에 이전 local evidence 초안 `docs/reports/windows-wsl2-smoke-execution.md`를 현재 branch에서 최신 결과로 재작성했다.
