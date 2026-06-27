# M2 Taxi local batch evidence source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/taxi-dataset-bootstrap`
- `docs/workflows/feature/m2-workflow-runner-integration`

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
| `main` historical workspace | `docs/workflows/feature/taxi-dataset-bootstrap` | `fd9720c` | 2026-06-27 | Taxi dataset/range/Gold metric/bootstrap decisions |
| `main` merged PR #167 | `docs/workflows/feature/m2-workflow-runner-integration` | `fd9720c` | 2026-06-27 | `Week2RunnerResult` compatible M2 runner boundary |

## Integration Notes / 통합 메모

- 이번 branch는 여러 live source branch를 merge하지 않는다. main에 merge된 workspace evidence를 읽고 후속 구현을 진행한다.
