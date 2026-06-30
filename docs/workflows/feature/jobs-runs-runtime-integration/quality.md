# C-29 품질 기록

## 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_job_run_handoff.py backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_catalog_publish.py -q
npm --prefix frontend run build
```

## 결과

- backend focused tests: 13 passed
- frontend build: 성공

## 확인한 회귀

- `local_runner` 실행은 `status=succeeded`, `runtime_evidence.executor_status=executed`로 남는다.
- Airflow/Spark 선택 run은 실행 성공으로 표시하지 않고 `status=ready_to_run`, `runtime_evidence.executor_status=readiness_only`로 남는다.
- `data/lake/gold/run_id=...` 경로의 parquet를 Catalog publish에서 읽을 때 Hive partition 해석 충돌이 나지 않는다.
