# M2 Docker Spark Taxi evidence source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/m2-taxi-5gb-local-evidence`

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
| `feature/m2-taxi-5gb-local-evidence` | `docs/workflows/feature/m2-taxi-5gb-local-evidence` | `9557d62d` | 2026-06-29 | Docker Spark evidence branch는 이 branch의 Taxi Spark runner와 5GB local evidence 보강 위에 쌓여 있다. |

## Integration Notes / 통합 메모

- 이전 branch가 main에 merge되지 않은 상태라 현재 PR은 stacked PR 성격이다. 이전 branch를 먼저 merge한 뒤 이 branch를 main 기준으로 다시 sync한다.
