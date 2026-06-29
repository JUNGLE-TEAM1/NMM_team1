# M6 SQL planner intent rules 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m6-sql-planner-intents`, `docs/workflows/feature/m6-sql-planner-intents`
- Date: 2026-06-28
- Workspace state: complete
- Context Budget mode: Lite Read with targeted escalation for M6 planner/guardrail behavior, latest product risk representative path, and stale branch dependency.
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/project-context/asklake-week2-module-plan/ver2/README.md`, `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`, `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`, `docs/workflows/feature/m6-duckdb-runtime-integration/report.md`, `backend/app/services/ai_query.py`, `backend/tests/test_week2_ai_query.py`.
- Escalated context read: `docs/03-interface-reference.md` guardrail failure code table, `origin/main` `e15300a` product risk representative path update, `origin/main` `e1ddef2` M2 product health runtime smoke update, current M6 DuckDB integration tests.
- Context omitted intentionally: external LLM, vector DB/RAG index, hybrid query, M1 UI changes, M5 Catalog write path.
- Changed: added `SqlPlanner` with deterministic `top_count`, `top_rating`, `top_risk`, `top_negative_review`, `low_conversion`, `top_late_delivery`, and `unsupported` intents; wired `Week2AIQueryService` to use planner results; added product health catalog retrieval aliases and summary copy; added planner/product health/unsupported regression tests; documented additive `unsupported_question` failure code in `docs/03`.
- Verified: TDD expected failure first; focused planner/M6 tests 21 passed; focused planner/M6/DuckDB tests 26 passed; post-rebase full backend tests 82 passed, 1 skipped; `git diff --check`; `jq -e . contracts/*.sample.json`; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`.
- Remaining: Public `route`/`retrieval_trace`, Catalog RAG, hybrid query, LLM, and canonical `dataset_product_health_gold` CatalogMetadata/Gold output fixture remain later steps.
- Next context: Branch was rebased onto `origin/main` `e1ddef2`; PR #231 is open and ready for final remote checks after force-push.
- Risk: Product health planner support is ready when CatalogMetadata exposes `risk_score`, `negative_review_rate`, `conversion_rate`, and `late_delivery_rate`. Main now includes M2 product health runtime smoke seed inputs, but the canonical CatalogMetadata sample still uses reviews Gold until a separate product health Gold fixture/data slice lands.
