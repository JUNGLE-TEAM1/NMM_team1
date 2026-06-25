# AskLake week 2 shared contract hardening source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/asklake-week2-contract-setup`
- `docs/project-context/asklake-week2-module-plan`

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`
- `query-result-contract-execution-prompt.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `codex/asklake-week2-module-plan` | `docs/workflows/feature/asklake-week2-contract-setup` | `0f2a3b0` | 2026-06-25 | Week 2 fixture contract setup 결과를 입력으로 사용 |
| `codex/asklake-week2-module-plan` | `docs/project-context/asklake-week2-module-plan` | `0f2a3b0` | 2026-06-25 | 2주차 계획과 QueryResult 실행 프롬프트를 입력으로 사용 |

## Integration Notes / 통합 메모

- 이전 검수 결과의 공통 부족분을 기준으로 route/ID/path/status/result/guardrail/smoke evidence를 보강했다.
