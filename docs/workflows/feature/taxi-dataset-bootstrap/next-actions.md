# M2 taxi dataset bootstrap 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: contract mapping drafted
- Summary: M2는 `yellow_tripdata_2024-01.parquet`, `taxi_trips`, `gold_taxi_daily_metrics` 기준으로 SourceConfig/WorkflowDefinition/ExecutionResult/CatalogMetadata mapping 초안을 갖고 있다.

## Recommended Next Action / 권장 다음 행동

- `demo`/`fixed` 실행 범위와 Contract Confirm을 정리한다.
- Reason: mapping 초안은 생겼지만 구현 branch로 넘어가기 전 반복 검증 기준과 M5 확인 질문을 닫아야 한다.

## Options / 선택지

1. `demo=10,000 rows`, `fixed=2024-01-01 pickup_date` 기준으로 확정한다.
2. M5에게 `ExecutionResult.row_count`, `bytes`, MinIO prefix 확인 질문을 보낸다.
3. 현재 branch를 검증하고 PR 준비 상태로 정리한다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- 다음 작업으로 1번을 권장한다.

## Last User Choice / 마지막 사용자 선택

- `yellow_tripdata_2024-01.parquet`로 로컬에서 작게 시작하되, 전체 Taxi dataset 적재 목표는 별도 scale target으로 분리한다.
- PostgreSQL table은 `taxi_trips`, 첫 Gold dataset은 `gold_taxi_daily_metrics`로 둔다.

## Next AI Action / 다음 AI 행동

- option 1이면 `notes.md`, `decisions.md`, `confirmations.md`에 `demo`/`fixed` 기준을 확정 기록한다.
- option 2이면 M5 확인 질문을 `next-actions.md`와 issue/PR body 후보에 정리한다.
- option 3이면 `scripts/status-workflow.sh`, harness validation, 필요 시 strict validation을 실행하고 Pre-PR checkpoint로 간다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
