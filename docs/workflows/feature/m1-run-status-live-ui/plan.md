# M1 Run Status Live UI 계획

## Phase

- Type: feature
- Branch/work location: `feature/m1-run-status-live-ui`, `docs/workflows/feature/m1-run-status-live-ui`
- Date: 2026-06-26
- Source plan: `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md` Phase 2

## 목표

`/runs` 화면에서 M5 Week2 workflow를 실행하고 `ExecutionResult`를 사용자가 확인할 수 있게 한다.

## 포함 범위

- `RunStatusPage`에서 `pipeline_reviews_json_e2e` 실행 버튼 연결
- 기존 Week2 API client의 `triggerWeek2Run`, `getWeek2Run` 소비
- `run_id`, `status`, `executor`, `row_count`, `bytes`, `duration_ms` 표시
- `task_results`, `outputs[].uri`, `logs` 표시 영역 추가
- loading, empty, error, fallback 상태 표시

## 제외 범위

- polling 또는 background refresh
- executor selection UI
- M5 backend, runner selection rule, SparkRunner, Airflow trigger 변경
- M3 TransformSpec 또는 ETL job logic 생성
- M6 query/catalog 내부 로직 변경

## 완료 기준

- `/etl` 외부 URL에서 Run Status 화면이 렌더링된다.
- 사용자가 local runner 실행 버튼과 refresh 버튼을 볼 수 있다.
- run 결과가 있으면 summary, task results, outputs, logs가 표시된다.
- 실패하면 fake success 대신 error state가 표시된다.
- frontend build와 하네스 strict validation을 통과한다.

