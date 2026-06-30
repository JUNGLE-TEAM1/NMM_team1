# Gold Build local materialization alignment 품질 기록

## Context

- Phase: C-17 `feature/gold-build-local-materialization-alignment`
- Date: 2026-06-30
- Branch/work location: `feature/external-connection-persistence` branch에서 진행. 기존 dirty worktree가 커서 branch 전환은 수행하지 않았다.

## Commands

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py backend/tests/test_week2_ai_query_duckdb.py -q
npm run build
```

## Results

- Backend focused tests: passed, `11 passed in 0.80s`
- Frontend build: passed
- HTTP smoke:
  - prepared Gold run execute: `materialization_mode=prepared_gold_reference`, `row_count=1000`, `output_path=data/local_sources/product_health/gold/gold_product_health.parquet`
  - Catalog publish: `storage.format=parquet`, actual parquet schema begins with `period_start`, `period_end`, `internal_product_id`
  - AI Query: succeeded, SQL starts `SELECT internal_product_id, risk_score ...`
- Browser smoke:
  - `/runs` shows `prepared parquet reference`, `rows 1000`, `gold_product_health.parquet`

## Regression Notes

- Existing `dataset_product_health_gold` local demo path remains JSONL and keeps `local_demo_jsonl`.
- Prepared parquet Catalog publish uses actual parquet schema to prevent AI Query allowlist / DuckDB column mismatch.
- `internal_product_id` is treated as a product key alias during catalog retrieval.

## Skipped / Deferred

- 대용량 ETL 신규 실행, Airflow trigger, Spark runner 실행은 C-17 범위에서 제외했다.
- Local DB에는 browser/API smoke로 created run/catalog records가 남아 있다.
