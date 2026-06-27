# M6 SQL execution context 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m6-sql-context`, `docs/workflows/feature/m6-sql-context`
- Date: 2026-06-27
- Workspace state: complete
- Context Budget mode: Lite Read with targeted code/context escalation for M6 SQL context behavior.
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, M6 SQL-first sections in Week2 ver2 project-context docs, `docs/03-interface-reference.md`, `backend/app/domain/ai_query.py`, `backend/app/services/ai_query.py`, `backend/app/fakes/fake_sql_engine.py`, `backend/tests/test_week2_ai_query.py`
- Escalated context read: `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `contracts/catalog_metadata.sample.json`, M5 workflow catalog tests using `local_fallback_path`
- Context omitted intentionally: DuckDB adapter implementation, external LLM/vector DB details, M1 UI, M2 runtime internals outside existing path handoff
- Changed: added `SqlEngineContext.local_fallback_path`, mapped it from `CatalogMetadata.storage.local_fallback_path`, blocked otherwise valid SQL with `local_path_missing` when the path is absent, and added M6 tests for context propagation and missing path guardrail.
- Verified: direct service smoke; focused `backend/tests/test_week2_ai_query.py` passed; full `backend/tests` passed with temporary dependency target; `git diff --check`; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`.
- Remaining: DuckDB adapter and actual file readability belong to later M6 steps. PR #182 remains open, so reviewers should check Source of Truth ordering before merge.
- Next context: M6 step 2 can add `DuckDBSqlEngine` behind `SqlEngineAdapter` using `SqlEngineContext.local_fallback_path`.
- Risk: this branch was created from `origin/main` while PR #182 is open; PR #193 documents that ordering risk and links Issue #194 for lifecycle tracking.
