# M2 Amazon Reviews JSONL runner evidence source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/docs/week2-main-e2e-path`
- `docs/workflows/feature/week2-m1-synthetic-raw`
- `docs/workflows/feature/m2-runtime-sparkrunner-smoke`

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
| `docs/week2-main-e2e-path` | `docs/workflows/docs/week2-main-e2e-path` | `1fa4469` | 2026-06-26 | Amazon Reviews JSON이 Week 2 main E2E path임을 확인했다. |
| `feature/week2-m1-synthetic-raw` | `docs/workflows/feature/week2-m1-synthetic-raw` | `1fa4469` | 2026-06-26 | M1 generated raw의 기본 path와 required field를 확인했다. 현재 이 worktree에는 generated `data/`가 없다. |
| `feature/m2-runtime-sparkrunner-smoke` | `docs/workflows/feature/m2-runtime-sparkrunner-smoke` | `1fa4469` | 2026-06-26 | `RuntimeConfig`와 `Week2SparkRunner`가 이미 merge된 상태임을 확인했다. |

## Integration Notes / 통합 메모

- 이번 branch는 source branch를 merge하는 작업이 아니라, merge된 main의 M2 runner와 M1/M3 경로 문맥을 읽고 후속 evidence를 추가하는 작업이다.
- generated `data/` 산출물은 Source of Truth가 아니며 commit하지 않는다.
