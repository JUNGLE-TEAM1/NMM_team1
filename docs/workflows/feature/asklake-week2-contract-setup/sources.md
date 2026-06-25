# AskLake week 2 contract setup source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/project-context/asklake-week2-module-plan/`

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`
- `contract-setup-prompt.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `codex/asklake-week2-module-plan` | `docs/project-context/asklake-week2-module-plan/` | `0f2a3b0` | 2026-06-25 | 2주차 모듈 분업 결정과 공통 계약 설정 프롬프트를 입력으로 사용 |

## Integration Notes / 통합 메모

- `decisions.md`를 canonical project context로 보고, `plan.md`의 M1~M6 producer/consumer 표와 `contract-setup-prompt.md`의 작업 범위를 반영했다.
