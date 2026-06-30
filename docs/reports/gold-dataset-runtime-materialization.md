# Gold dataset runtime materialization 보고서

## Short Report / 짧은 보고

- Type: Feature Phase
- Date: 2026-06-30
- Changed: Gold local runner가 materialized Silver parquet 입력으로 Gold parquet를 생성하고 object storage `not_uploaded` evidence를 분리해 기록
- Verified: backend focused tests `8 passed`, frontend build 성공, browser smoke에서 `dataset_c28_browser_gold` 실행 후 parquet output/rows/bytes/storage 표시 확인
- Remaining: 실제 MinIO upload opt-in 실행, production-grade recipe engine, Catalog/AI Query runtime E2E
- Next context: C-29 `feature/jobs-runs-runtime-integration`
- Risk: Gold rows는 demo-safe generated output이며 운영 ETL 의미를 완전히 대체하지 않음

## 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_job_run_handoff.py backend/tests/test_week2_storage_adapter.py -q
npm --prefix frontend run build
```

## 증거

- Workspace report: `docs/workflows/feature/gold-dataset-runtime-materialization/report.md`
- Quality: `docs/workflows/feature/gold-dataset-runtime-materialization/quality.md`
- Browser smoke run id: `986517ff-3224-4100-9c7c-9c1072bd0a2a`
- Browser smoke output: `data/dataset_runs/986517ff-3224-4100-9c7c-9c1072bd0a2a/gold/dataset_c28_browser_gold.parquet`
