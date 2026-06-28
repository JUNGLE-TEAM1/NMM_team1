# M6 response contract route and retrieval trace 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m6-response-contract-trace`, `docs/workflows/feature/m6-response-contract-trace`
- Date: 2026-06-28
- Workspace state: complete
- Context Budget mode: Lite Read with targeted escalation for public response contract, M6 planner/guardrail behavior, and prior M6 reports.
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `backend/app/domain/ai_query.py`, `backend/app/services/ai_query.py`, `backend/tests/test_week2_ai_query.py`.
- Escalated context read: `docs/reports/m6-duckdb-runtime-integration.md`, `docs/reports/m6-sql-planner-intents.md`.
- Context omitted intentionally: external LLM, vector DB/RAG index, hybrid route execution, M1 UI rendering, M5 Catalog write path.
- Changed: `AIQueryResult`에 `route`와 `retrieval_trace`를 추가하고, SQL-first 응답은 `sql`, unsupported 질문은 `unsupported` route를 반환하게 했다. Catalog retrieval score/matched terms/evidence index를 trace로 노출하고, contract sample과 docs/03/05/06/07을 갱신했다.
- Verified: TDD expected failure first; focused M6/SQL/DuckDB tests 26 passed; full backend tests 82 passed, 1 skipped; `git diff --check`; `jq -e . contracts/*.sample.json`; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`.
- Remaining: remote CI, merge/finalize/cleanup are not done yet.
- Next context: 다음 M6 단계는 Catalog RAG Index 또는 M1 route/trace display follow-up 중 하나다.
- Risk: `rag`와 `hybrid`는 enum에 포함됐지만 아직 실행되지 않는다. 현재 trace는 CatalogMetadata selection 단위만 노출한다.
