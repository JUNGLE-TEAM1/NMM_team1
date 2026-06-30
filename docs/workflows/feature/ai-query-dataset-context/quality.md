# AI query dataset context 품질 게이트

- TDD status: applied.
- Quality gate status: passed-with-skips
- Required checks: backend focused tests, frontend build, browser smoke, `scripts/validate-harness.sh`.
- Manual verification: Product Health CatalogMetadata 기반 질문 실행, SQL/rows/evidence 표시.
- Regression focus: write SQL, unsupported dataset, empty result가 안전하게 처리되어야 한다.

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M6가 저장된 Product Health CatalogMetadata의 `storage_uri/query_table/allowed_columns/canonical_demo_query`를 소비해야 하는 integration contract 변경이다.
- Failing test first: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_ai_query_duckdb.py -q`
- Expected failure command/result: first failure was `KeyError: 'query'` in `CatalogRetriever._score` when stored catalog used top-level `allowed_columns` without nested `query`.
- Pass command/result: same command passed `2 passed`.
- Refactor notes: `backend/app/services/catalog_metadata.py` helper로 CatalogMetadata nested shape와 top-level alias 해석을 공유했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| focused M6 SQL/Catalog tests | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_ai_query.py backend/tests/test_sql_planner.py backend/tests/test_duckdb_sql_engine.py backend/tests/test_catalog_retrieval_index.py backend/tests/test_week2_ai_query_duckdb.py -q` | passed | `37 passed` |
| focused M6 + LLM safety tests | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_ai_query.py backend/tests/test_sql_planner.py backend/tests/test_duckdb_sql_engine.py backend/tests/test_catalog_retrieval_index.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_openai_llm_adapter.py -q` | passed | `42 passed` |
| Product Health contract tests | `.venv/bin/python -m pytest tests/test_product_health_contracts.py -q` | passed | `4 passed` |
| Python compile | `PYTHONPATH=backend .venv/bin/python -m py_compile backend/app/services/catalog_metadata.py backend/app/services/ai_query.py backend/app/services/catalog_retriever.py backend/app/services/catalog_rag_index.py backend/app/services/sql_planner.py backend/app/domain/ai_query.py backend/app/fakes/fake_sql_engine.py backend/tests/test_week2_ai_query_duckdb.py` | passed | no output |
| backend tests | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q` | environment gap | `144 passed`, 2 Taxi Spark tests failed because local Java Runtime is unavailable |
| frontend build | `cd frontend && npm run build` | passed | Vite build passed |
| diff check | `git diff --check` | passed | no output |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |
| local API smoke | `POST /api/week2/ai/query` with local `data/results/week2/_metadata/catalog/dataset_product_health_gold.json` | passed | `dataset_product_health_gold`, `engine=duckdb`, `route=sql`, first row `ph_000028` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes for implementation PR
- CI result: pending
- Deploy/publish required: no
- Deployment confirmation: not required
- Rollback/smoke notes: not applicable yet

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| browser smoke | backend service/contract slice이며 UI 변경 없음. local API smoke와 frontend build로 대체했다. | n/a |
| full backend Spark success | local machine has no Java Runtime, so Taxi Spark tests cannot pass in this environment. This is unrelated to M6 Catalog/DuckDB changes. | n/a |
