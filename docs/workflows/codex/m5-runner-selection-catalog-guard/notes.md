# M5 Runner Selection Catalog Guard 노트

## 2026-06-26 시작 노트

- 이 Phase는 slice마다 새 branch/workspace/report/full validation을 반복하지 않는다.
- Phase 시작/종료에만 하네스 문서를 넓게 다루고, 각 slice는 focused code/test loop로 처리한다.
- 현재 코드 기준 실제 외부 Airflow 연결은 없다.
- 현재 코드에는 `Week2AirflowAdapter` boundary와 local runner fallback 경계가 있다.
- `Week2WorkflowService`는 successful run status에서만 Catalog latest metadata를 갱신한다.

## 현재 구현/gap 초안

| 영역 | 현재 상태 | 이번 Phase 처리 |
| --- | --- | --- |
| local runner baseline | 구현됨 | focused test로 보호 |
| Airflow adapter boundary | 구현됨. 기본 adapter는 not configured error | 실제 연결은 제외 |
| Airflow fallback | 구현됨 | baseline 보호 |
| Catalog latest guard | 구현됨 | baseline 보호 |
| run/catalog persistence | local JSON handoff 구현됨 | baseline 보호 |
| SparkRunner | 미구현 | 후속 slice로 분리 |
| M3 TransformSpec adapter | 미구현 | 후속 slice로 분리 |
| actual Airflow API/DAG | 미구현 | 후속 slice로 분리 |

## Slice 진행 메모

- Slice 1: focused baseline test passed. `test_week2_workflow_catalog.py`, `test_week2_local_runner.py`, `test_week2_ai_query.py` 기준 18 passed.
- Slice 2: unknown executor guard implemented. API schema rejects unknown executor with 422, and service direct call now raises `Week2WorkflowInvalidExecutorError` without creating a run.
- Slice 3: future `spark` executor is explicitly deferred by the same guard. Actual `SparkRunner` integration remains a follow-up slice.
- Slice 4: final lightweight checks passed. `git diff --check` clean; focused M5/M6 tests 20 passed.
- Slice 5: done. `spark`, `spark_runner`, and typo executor values are rejected before run creation; actual `SparkRunner` integration remains deferred until M2 handoff.

## 구현 메모

- `Week2WorkflowService.trigger_run()` now validates executor before incrementing run sequence.
- This prevents `executor="spark"` or typo values from silently entering the Airflow fallback path.
- `backend/app/api/week2_workflow.py` maps `Week2WorkflowInvalidExecutorError` to HTTP 400 for service-level invalid executor errors, while request schema still rejects unsupported API payload values with 422.
- `contracts/runtime_config.sample.json` mentions future `spark_runner`, but current M5 API/service supported executors remain `local_runner` and `airflow` until actual M2 SparkRunner integration.
