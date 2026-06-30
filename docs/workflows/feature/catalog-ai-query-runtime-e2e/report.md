# C-30 Catalog AI Query Runtime E2E 보고서

## Short Report / 짧은 보고

- Type: Phase C-30
- Date: 2026-06-30
- Changed: runtime Gold parquet publish 후 AI Query가 live CatalogDataset을 DuckDB로 읽는 E2E 테스트를 추가하고 parquet reader의 hive partition 자동 해석을 차단했다.
- Verified: backend focused tests 10 passed, frontend build 성공.
- Remaining: C-31에서 브라우저 deep E2E로 화면 클릭 흐름을 검수한다.
- Next context: External Connection부터 Source/Silver/Gold Run/Catalog/AI Query까지 실제 화면에서 이어지는지 확인하면 된다.
- Risk: RAG/vector DB/LLM은 여전히 범위 밖이다. 현재는 deterministic SQL planner + DuckDB read-only 경로다.

## 구현 요약

- DuckDB parquet registration에서 `hive_partitioning=false`를 명시해 `run_id=...` 폴더명이 컬럼처럼 병합되는 문제를 방지했다.
- `test_ai_query_duckdb_reads_runtime_gold_catalog_dataset`을 추가해 Target Dataset Run 실행, Catalog publish, AI Query SQL 실행까지 검증했다.

## 검증

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_ai_query_dataset_context.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_target_dataset_catalog_publish.py -q
npm --prefix frontend run build
```
