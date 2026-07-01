# Product Health Lake Catalog Handoff

## Short Report / 짧은 보고

- Type: Phase C-50
- Date: 2026-07-01
- Changed: Product Health C-49 lake output을 CatalogDataset과 AI Query가 같은 catalog/run/path로 소비하는 regression smoke를 추가했다.
- Verified: focused backend 11 passed, frontend build passed, browser `/catalog`/`/query` smoke passed, `git diff --check` passed.
- Remaining: full browser demo smoke에서 실제 클릭 흐름 전체를 확인한다.
- Next context: C-51 또는 full browser demo smoke.
- Risk: full 5GB ETL, Airflow/Spark 실행, MinIO upload는 후속 범위다.

## 변경 파일

- `backend/tests/test_ai_query_dataset_context.py`
- `docs/workflows/feature/product-health-lake-catalog-handoff/quality.md`
- `docs/workflows/feature/product-health-lake-catalog-handoff/sync.md`
- `docs/workflows/feature/product-health-lake-catalog-handoff/next-actions.md`
- `docs/workflows/feature/product-health-lake-catalog-handoff/report.md`

## 구현 요약

- Product Health prepared write-through run을 실행한다.
- Catalog publish 결과가 C-49 lake output path를 storage path로 유지하는지 확인한다.
- AI Query selected dataset, evidence, retrieval trace, SQL table context, DuckDB result가 같은 live CatalogDataset/run/path를 쓰는지 검증한다.
- prepared path는 `runtime_evidence.reference_evidence.path`에만 남고 AI Query evidence latest path로 노출되지 않는다.

## 검증

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py -q
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py backend/tests/test_week2_ai_query_duckdb.py -q
npm --prefix frontend run build
git diff --check
```

Browser smoke:

- `/catalog`
- `/query`

결과:

- focused backend: 11 passed
- frontend build: passed
- browser smoke: passed
- whitespace check: passed

## 다음 Phase 문맥

- 실제 클릭 흐름 전체에서 `/runs` 실행/등록, `/catalog` 확인, `/query` 질문을 이어서 확인한다.
- prepared reference path가 최신 output처럼 표시되면 C-50 회귀다.
