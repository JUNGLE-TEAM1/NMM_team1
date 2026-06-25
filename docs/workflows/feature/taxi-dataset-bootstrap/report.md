# M2 taxi dataset bootstrap 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/taxi-dataset-bootstrap`, `docs/workflows/feature/taxi-dataset-bootstrap`
- Date: 2026-06-25
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `scripts/status-workflow.sh docs/workflows/feature/taxi-dataset-bootstrap`, `contracts/source_config.sample.json`, `contracts/workflow_definition.sample.json`, `contracts/execution_result.sample.json`, `contracts/catalog_metadata.sample.json`, `plan.md`, `notes.md`, `decisions.md`, `next-actions.md`, `quality.md`
- Escalated context read: none
- Context omitted intentionally: 전체 Source of Truth 재검토는 하지 않음. 변경 범위가 branch workspace 문서 내부 전략 정리에 한정됨.
- Changed: M2 데이터 규모 전략을 `demo -> fixed -> local-full-month -> scale-target`으로 분리하고, `yellow_tripdata_2024-01.parquet`, `taxi_trips`, `gold_taxi_daily_metrics`, `demo=10,000 rows`, `fixed=pickup_date 2024-01-01` 기준 Taxi contract mapping 초안을 기록함. 최신 `origin/main`도 merge commit `c8859ff`로 반영함.
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `git diff --check` 통과
- Remaining: PR 생성 여부 선택. PostgreSQL 적재 소유권과 MinIO prefix는 후속 구현/통합 branch에서 조율한다.
- Next context: `docs/workflows/feature/taxi-dataset-bootstrap/notes.md`의 M2 Taxi 계약 mapping 초안, M5 Workflow/Status/Catalog contract
- Risk: 한 달 파일 전체 처리는 로컬 검증일 뿐 전체 Taxi dataset 또는 GB/TB급 ETL 가능성을 증명하지 않음. M5 metric 표준이 나중에 달라지면 M2 implementation branch에서 adapter mapping을 조정해야 한다.
- Remote operations reconciliation: issue `#78`은 사람이 reopen했고 PR merge 전 기대 상태는 issue `Open`, GitHub Project `In Progress`다. 현재 로컬 `gh` 인증은 invalid라 remote issue state 자동 조회는 불가하다.
