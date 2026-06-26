# M2 Workflow runner 연동 source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/m2-amazon-reviews-runner-evidence`
- `docs/workflows/feature/week2-workflow-catalog`

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
| `origin/feature/m2-amazon-reviews-runner-evidence` | `docs/workflows/feature/m2-amazon-reviews-runner-evidence` | `8935337` | 2026-06-27 | M2 `Week2SparkRunner` Amazon Reviews JSONL Parquet evidence와 runner output shape를 입력으로 사용 |
| `origin/codex/week2-workflow-catalog` | `docs/workflows/feature/week2-workflow-catalog` | `74e5e3c` | 2026-06-27 | M5 `Week2WorkflowService`, API route, `ExecutionResult`/`CatalogMetadata` persistence 흐름을 입력으로 사용 |

## Integration Notes / 통합 메모

- 이번 branch는 M5 workflow runtime과 M2 SparkRunner runtime boundary를 잇는 integration workspace다.
- M3 transform semantics, Airflow DAG 내부 실행, MinIO/S3 write는 source branch에서 가져오지 않고 후속 작업으로 남긴다.
