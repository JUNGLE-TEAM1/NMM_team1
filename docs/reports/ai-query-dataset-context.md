# AI Query Catalog 연결 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: M6 AI Query가 fixture catalog나 추측한 output path 대신 저장된 Product Health `CatalogMetadata`를 읽어 DuckDB SQL context를 만들게 했다. Nested `query.*`/`storage.local_fallback_path`와 PR 5/6 top-level alias인 `query_table`, `allowed_columns`, `canonical_demo_query`, local `storage_uri`를 함께 지원한다.
- Verified: focused M6 SQL/Catalog tests `37 passed`, M6 + LLM safety tests `42 passed`, Product Health contract tests `4 passed`, Python compile passed, frontend build passed, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, local API smoke에서 `dataset_product_health_gold`, `engine=duckdb`, `route=sql`, first row `ph_000028` 확인.
- Remaining: PR push/review. Full backend suite는 `144 passed`, 2 Taxi Spark tests failed because this local machine has no Java Runtime.
- Next context: PR 5/6이 remote/object-only `storage_uri`를 제공하면 M6는 직접 추측하거나 credential 없이 remote read하지 않고 M5 local fallback materialization 또는 DuckDB remote credential policy를 별도 결정해야 한다.
- Risk: 이번 Phase는 CatalogMetadata 저장 자체를 구현하지 않는다. 저장된 catalog가 없거나 local readable path가 없으면 AI Query가 blocked를 반환하는 것이 정상이다.

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/ai-query-dataset-context`, `docs/workflows/feature/ai-query-dataset-context`
- Date: 2026-06-30
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/reports/m6-m5-catalog-source-adapter.md`
- `docs/reports/m6-duckdb-runtime-integration.md`
- `contracts/product_health_catalog_metadata.sample.json`

## Goal / 목표

- AI Query가 직접 output file path를 추측하지 않고 Catalog에 등록된 `gold_product_health` metadata를 기준으로 DuckDB SQL을 실행한다.

## Changed Files / 변경 파일

- `backend/app/services/catalog_metadata.py`
- `backend/app/services/ai_query.py`
- `backend/app/domain/ai_query.py`
- `backend/app/services/sql_planner.py`
- `backend/app/services/catalog_retriever.py`
- `backend/app/services/catalog_rag_index.py`
- `backend/app/fakes/fake_sql_engine.py`
- `backend/tests/test_week2_ai_query_duckdb.py`
- `docs/03-interface-reference.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/workflows/feature/ai-query-dataset-context/*`

## Implementation Summary / 구현 요약

- `catalog_metadata.py` helper로 CatalogMetadata의 nested shape와 PR 5/6 alias 해석을 한 곳에 모았다.
- `Week2AIQueryService`가 Catalog에서 `query_table`, `allowed_columns`, `canonical_demo_query`, local `storage_uri` 또는 `storage.local_fallback_path`를 읽어 `SqlEngineContext`로 전달한다.
- Product Health risk/demo 질문은 Catalog의 `canonical_demo_query`를 우선 사용하고, DuckDB engine의 SELECT-only/table/column/LIMIT/path guardrail을 그대로 통과한다.
- `CatalogRetriever`와 `CatalogRetrievalIndex`는 top-level alias도 검색/trace 근거로 읽되, storage path 자체는 RAG chunk로 노출하지 않는다.
- 저장된 `Week2CatalogStore` catalog와 실제 temp `gold_product_health.parquet`를 사용하는 DuckDB regression test를 추가했다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read에서 시작, M6/Catalog/DuckDB integration 위험 때문에 필요한 Source of Truth와 관련 M6 report만 Escalate Read.
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md` C-7, workspace status.
- Escalated context read: `docs/03`, `docs/05`, `docs/06`, `docs/07`, M6/M5 관련 최신 report, Product Health catalog contract.
- Context omitted intentionally: M1 화면 세부 구현, MongoDB source seed 세부, external vector DB/LLM provider 문서.

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

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/ai-query-dataset-context/quality.md`
- Quality gate status: passed-with-skips
- TDD status: applied. New DuckDB/Catalog test first failed on missing top-level alias handling, then passed after helper/service changes.
- CI/check result: local checks passed. PR CI not run yet.
- Skipped checks: full backend green is blocked by missing local Java Runtime for Taxi Spark tests.
- CD/deploy gate: not applicable.

## Regression Guard / 회귀 보호

- Checked feature: M6 AI Query SQL route, DuckDB guardrail, Catalog retriever/index compatibility.
- Protected behavior: AI Query does not guess Product Health output paths; it uses Catalog-provided table/columns/path and remains blocked when local readable storage is absent.
- Result: passed for focused tests and local API smoke.

## Failure Scenario / 실패 시나리오

- Reviewed failure: missing catalog, missing local fallback path, remote-only `storage_uri`, unsafe SQL.
- Expected behavior: query is blocked or guarded instead of fabricating path/rows.
- Verification: DuckDB service tests, SQL planner tests, local API smoke.
- Result: passed for local path case; remote-only read remains deferred by design.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: M6 Ask/Evidence, SQL-first DuckDB path, CatalogMetadata-backed evidence.
- Status: implemented for Product Health `gold_product_health` local Catalog path.
- Evidence: test and smoke results above.

## Document Updates / 문서 업데이트

- Updated: `docs/03-interface-reference.md`, `docs/06-regression-and-failure-scenarios.md`, branch workspace docs, this report.
- Not updated and why: `README.md` is an external summary and this is an internal M6/Catalog integration detail. `docs/02` architecture boundary is unchanged.

## Secret / Migration / Env Check

- Secret check: no secret committed.
- Migration/data change: no migration. Tests create temp Parquet data only.
- Env change: no new env var or dependency.

## Final Judgment / 최종 판단

- Done: AI Query now reads Product Health CatalogMetadata for DuckDB execution and keeps path guessing out of M6.
- Remaining risk: PR 5/6 storage shape must provide a local readable path or an explicitly approved remote read policy.
