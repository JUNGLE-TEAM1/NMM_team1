# C-30 품질 기록

## 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_ai_query_dataset_context.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_target_dataset_catalog_publish.py -q
npm --prefix frontend run build
```

## 결과

- backend focused tests: 10 passed
- frontend build: 성공

## 확인한 회귀

- published Target Dataset CatalogDataset이 fixture보다 먼저 AI Query context로 선택된다.
- DuckDB가 runtime Gold parquet를 read-only SQL로 조회한다.
- `data/lake/gold/run_id=...` 경로는 Hive partition으로 해석하지 않고 단일 parquet 파일로 읽는다.
