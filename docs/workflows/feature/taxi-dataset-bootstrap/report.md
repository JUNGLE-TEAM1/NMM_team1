# M2 taxi dataset bootstrap 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/taxi-dataset-bootstrap`, `docs/workflows/feature/taxi-dataset-bootstrap`
- Date: 2026-06-25
- Workspace state: draft
- Context Budget mode: Lite Read
- Primary context read: `scripts/status-workflow.sh docs/workflows/feature/taxi-dataset-bootstrap`, `contracts/source_config.sample.json`, `contracts/workflow_definition.sample.json`, `contracts/execution_result.sample.json`, `contracts/catalog_metadata.sample.json`, `plan.md`, `notes.md`, `decisions.md`, `next-actions.md`, `quality.md`
- Escalated context read: none
- Context omitted intentionally: 전체 Source of Truth 재검토는 하지 않음. 변경 범위가 branch workspace 문서 내부 전략 정리에 한정됨.
- Changed: M2 데이터 규모 전략을 `demo -> fixed -> local-full-month -> scale-target`으로 분리하고, `yellow_tripdata_2024-01.parquet`, `taxi_trips`, `gold_taxi_daily_metrics` 기준 Taxi contract mapping 초안을 기록함.
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict` 통과
- Remaining: `demo`/`fixed` row/date 범위 확정, `ExecutionResult.row_count`와 `bytes` 의미 확인, PostgreSQL 적재 소유권과 MinIO prefix를 M1/M5와 조율
- Next context: `docs/workflows/feature/taxi-dataset-bootstrap/notes.md`의 M2 Taxi 계약 mapping 초안, M5 Workflow/Status/Catalog contract
- Risk: 한 달 파일 전체 처리는 로컬 검증일 뿐 전체 Taxi dataset 또는 GB/TB급 ETL 가능성을 증명하지 않음. scale target은 후속 branch에서 별도 검증 필요.
