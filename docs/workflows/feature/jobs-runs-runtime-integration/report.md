# C-29 Jobs Runs Runtime Integration 보고서

## Short Report / 짧은 보고

- Type: Phase C-29
- Date: 2026-06-30
- Changed: Target Dataset Job Run execute를 executor별 공통 Run record shape로 정렬했다.
- Verified: backend focused tests 13 passed, frontend build 성공.
- Remaining: 실제 Airflow DAG trigger와 Spark job 실행은 후속 Phase에서 result artifact 계약이 준비된 뒤 연결한다.
- Next context: C-30에서 `succeeded` local runner output을 Catalog/AI Query live path로 소비하면 된다. Airflow/Spark `ready_to_run` record는 성공 데이터셋으로 publish하지 않는다.
- Risk: Airflow/Spark 버튼은 readiness 기록만 남기므로 발표 시 실제 실행 성공으로 말하면 안 된다.

## 구현 요약

- `TargetDatasetRuntimeExecutor`를 추가해 `local_runner`, `airflow`, `spark_runner`를 같은 execute endpoint에서 처리한다.
- `local_runner`는 기존 materialization 결과를 `execution_evidence`로 보강한다.
- `airflow`와 `spark_runner`는 trigger 없이 `ready_to_run`/`readiness_only` evidence를 남긴다.
- `/runs` 카드에 executor, run role, artifact 상태를 표시한다.
- Catalog publish parquet sample reader를 단일 파일 reader로 바꿔 `run_id=...` 폴더명이 partition으로 해석되는 문제를 막았다.

## 검증

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_job_run_handoff.py backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_catalog_publish.py -q
npm --prefix frontend run build
```

## 다음 Phase 문맥

- C-30은 `status=succeeded`이고 `output_path`가 있는 run만 Catalog/AI Query 소비 대상으로 유지한다.
- Airflow/Spark의 실제 성공 연결은 `result_artifact_status=connected`를 만들 수 있는 별도 Phase에서 진행한다.
