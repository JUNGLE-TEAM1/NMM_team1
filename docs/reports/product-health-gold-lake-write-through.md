# Product Health Gold Lake Write-through

## Short Report / 짧은 보고

- Type: Phase C-49
- Date: 2026-07-01
- Changed: Product Health prepared Gold parquet 실행이 prepared path를 최신 output으로 노출하지 않고 `data/lake/gold/run_id=<run_id>/...parquet`에 copy/write-through한 파일을 Run output으로 저장하게 했다.
- Verified: focused backend 14 passed, frontend build passed, `git diff --check` passed.
- Remaining: C-50에서 Catalog/AI Query가 같은 lake output을 읽는지 clean-room handoff를 닫는다.
- Next context: C-50 Product Health lake Catalog handoff.
- Risk: full 5GB ETL, Airflow/Spark 실행, MinIO upload는 후속 범위다.

## 변경 파일

- `backend/app/services/target_dataset_local_runner.py`
- `backend/app/services/target_dataset_runtime_executor.py`
- `backend/tests/test_target_dataset_local_materialization.py`
- `backend/tests/test_target_dataset_catalog_publish.py`
- `frontend/src/app/App.jsx`
- `docs/workflows/feature/product-health-gold-lake-write-through/quality.md`
- `docs/workflows/feature/product-health-gold-lake-write-through/sync.md`
- `docs/workflows/feature/product-health-gold-lake-write-through/next-actions.md`
- `docs/workflows/feature/product-health-gold-lake-write-through/report.md`

## 구현 요약

- prepared Product Health Gold parquet를 read-only reference로 유지한다.
- 성공 Run마다 `data/lake/gold/run_id=<run_id>/<gold_output>.parquet`에 copy/write-through output을 만든다.
- Run `output_path`, `row_count`, `output_bytes`, `runtime_evidence.output_path`는 lake output 기준이다.
- prepared input path는 `runtime_evidence.reference_evidence.path`에 남기고 `latest_output=false`로 표시한다.
- `/runs` mode label은 `prepared parquet write-through`로 구분한다.

## 검증

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py -q
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_job_run_handoff.py -q
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_job_run_handoff.py backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_product_health_preset_synthesis.py -q
npm --prefix frontend run build
git diff --check
```

결과:

- focused backend: 14 passed
- frontend build: passed
- whitespace check: passed

## 다음 Phase 문맥

- C-50에서는 Catalog/AI Query가 `data/lake/gold/run_id=<run_id>/...parquet`를 계속 읽는지 확인한다.
- prepared path는 reference evidence로만 노출되어야 한다.
- object storage는 `not_uploaded` 상태이며 실제 MinIO upload는 후속 Phase다.
