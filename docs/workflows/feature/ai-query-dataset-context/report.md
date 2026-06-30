# AI query dataset context 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/ai-query-dataset-context`, `docs/workflows/feature/ai-query-dataset-context`
- Date: 2026-06-30
- Workspace state: complete
- Context Budget mode: Lite Read에서 시작, M6/Catalog/DuckDB integration 위험으로 `docs/03`, `docs/05`, `docs/06`, `docs/07`, 관련 M6/M5 report까지 Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md` C-7, workspace status
- Escalated context read: `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `docs/reports/m6-m5-catalog-source-adapter.md`, `docs/reports/m6-duckdb-runtime-integration.md`, `contracts/product_health_catalog_metadata.sample.json`
- Changed: M6 AI Query가 저장된 Product Health `CatalogMetadata`의 nested shape와 PR 5/6 top-level alias(`query_table`, `allowed_columns`, `canonical_demo_query`, local `storage_uri`)를 모두 읽어 DuckDB SQL context를 만들게 했다. Product Health risk/demo 질문은 Catalog의 `canonical_demo_query`를 우선 사용하고, DuckDB guardrail은 기존처럼 SELECT-only/table/column/LIMIT/path를 검증한다.
- Verified: focused M6 SQL/Catalog tests `37 passed`; focused M6 + LLM safety tests `42 passed`; Product Health contract tests `4 passed`; Python compile passed; frontend build passed; `git diff --check` passed; `scripts/validate-harness.sh` and `scripts/validate-harness.sh --strict` passed; local API smoke returned `dataset_product_health_gold`, `engine=duckdb`, `route=sql`, first row `ph_000028`.
- Remaining: commit, push, PR. Full backend suite has an environment-only gap: `144 passed`, 2 Taxi Spark tests failed because this local machine has no Java Runtime.
- Next context: PR 5/6이 remote/object-only `storage_uri`를 제공하면 M6 remote read가 아니라 M5 local fallback materialization 또는 DuckDB remote credential policy를 별도 결정해야 한다.
- Risk: 이번 Phase는 CatalogMetadata 저장을 구현하지 않는다. 저장된 catalog가 없거나 path가 remote-only이면 SQL query는 blocked 상태가 정상이다.

## Implementation Summary / 구현 요약

- `backend/app/services/catalog_metadata.py`를 추가해 CatalogMetadata query/storage alias 해석을 한 곳으로 모았다.
- `Week2AIQueryService`가 `storage_uri` local path, `query_table`, `allowed_columns`, `canonical_demo_query`를 `SqlEngineContext`로 전달한다.
- `CatalogRetriever`와 `CatalogRetrievalIndex`가 top-level allowed columns/table alias도 검색과 trace 근거로 사용할 수 있게 했다.
- `SqlPlanner`가 Product Health risk query에서 `canonical_demo_query`를 우선 사용한다.
- 저장된 `Week2CatalogStore` catalog와 실제 `gold_product_health.parquet`를 사용하는 DuckDB regression test를 추가했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_ai_query_duckdb.py -q
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_ai_query.py backend/tests/test_sql_planner.py backend/tests/test_duckdb_sql_engine.py backend/tests/test_catalog_retrieval_index.py backend/tests/test_week2_ai_query_duckdb.py -q
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_ai_query.py backend/tests/test_sql_planner.py backend/tests/test_duckdb_sql_engine.py backend/tests/test_catalog_retrieval_index.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_openai_llm_adapter.py -q
.venv/bin/python -m pytest tests/test_product_health_contracts.py -q
PYTHONPATH=backend .venv/bin/python -m py_compile backend/app/services/catalog_metadata.py backend/app/services/ai_query.py backend/app/services/catalog_retriever.py backend/app/services/catalog_rag_index.py backend/app/services/sql_planner.py backend/app/domain/ai_query.py backend/app/fakes/fake_sql_engine.py backend/tests/test_week2_ai_query_duckdb.py
cd frontend && npm run build
git diff --check
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```
