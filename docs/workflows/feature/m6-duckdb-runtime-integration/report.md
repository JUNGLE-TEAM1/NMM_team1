# M6 DuckDB runtime integration 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m6-duckdb-runtime-integration`, `docs/workflows/feature/m6-duckdb-runtime-integration`
- Date: 2026-06-27
- Workspace state: complete
- Context Budget mode: Lite Read with targeted integration escalation for M6 runtime and Week2 evidence path.
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/03-interface-reference.md`, `docs/project-context/asklake-week2-module-plan/ver2/README.md`, `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`, `backend/app/core/container.py`, `backend/app/core/settings.py`, `backend/app/services/ai_query.py`, `backend/app/adapters/duckdb_sql_engine.py`, `backend/tests/test_week2_ai_query.py`, `backend/tests/test_duckdb_sql_engine.py`.
- Escalated context read: `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, existing M6 Step 1/2 workspace reports and source records.
- Context omitted intentionally: SQL planner/RAG/LLM implementation details, M1 UI layout changes, M5 catalog write ownership, Trino/Athena/vector DB.
- Changed: `Settings.week2_sql_engine` and `WEEK2_SQL_ENGINE` env override were added; `AppContainer` now uses `DuckDBSqlEngine` by default and `FakeSqlEngine` only when explicitly configured; tests now verify Week2 workflow output is queried through DuckDB and no longer returns fake row values.
- Verified: TDD expected failure first; focused tests `17 passed`; full backend tests `66 passed`; `git diff --check`; `jq -e . contracts/*.sample.json`; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`; local API smoke returned `query_result.engine="duckdb"` and real rows from `dataset_reviews_gold.jsonl`.
- Remaining: SQL planner/intent expansion, retrieval trace, RAG index, and external LLM remain later M6 steps.
- Next context: M6 Step 4 should strengthen SQL planning/intent rules while continuing to use `SqlEngineAdapter` and DuckDB-backed output file evidence.
- Risk: Fresh `/query` without a generated Week2 catalog/output file may be blocked by missing `local_fallback_path`; this is intended evidence behavior, and local runner should be executed before demo query smoke.
