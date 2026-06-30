# Jobs Runs Runtime Integration 보고서

## Short Report / 짧은 보고

- Type: Phase C-29
- Date: 2026-06-30
- Changed: Target Dataset Job Run execute를 executor별 공통 Run record shape로 정렬했다.
- Verified: backend focused tests 13 passed, frontend build 성공.
- Remaining: 실제 Airflow DAG trigger와 Spark job 실행은 후속 Phase에서 result artifact 계약이 준비된 뒤 연결한다.
- Next context: C-30에서 `succeeded` local runner output을 Catalog/AI Query live path로 소비하면 된다.
- Risk: Airflow/Spark `ready_to_run` evidence는 실행 성공이 아니다.

## 구현 요약

- `backend/app/services/target_dataset_runtime_executor.py` 추가.
- `local_runner` 실행 결과에 `executor_status=executed`, `run_record_role=execution_evidence`를 추가.
- Airflow/Spark execute 요청은 `status=ready_to_run`, `executor_status=readiness_only`, `trigger_attempted=false`, `result_artifact_status=not_connected`로 기록.
- `/runs` UI 카드에 executor, run role, artifact 상태를 표시.
- Catalog publish의 parquet sample read를 단일 파일 reader로 변경해 `data/lake/gold/run_id=...` 경로와 `run_id` 컬럼 충돌을 방지.

## 검증

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_job_run_handoff.py backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_catalog_publish.py -q
npm --prefix frontend run build
```

- backend focused tests: 13 passed
- frontend build: 성공

## Regression Guard

- Airflow queued/readiness 상태가 `succeeded`로 보이면 실패다.
- Spark readiness만으로 output path가 생기면 실패다.
- local runner succeeded run은 기존 Catalog publish가 계속 가능해야 한다.

## Final Judgment

- Done: C-29 범위 완료.
- Remaining risk: 실제 Airflow/Spark execution은 아직 연결하지 않았다.
