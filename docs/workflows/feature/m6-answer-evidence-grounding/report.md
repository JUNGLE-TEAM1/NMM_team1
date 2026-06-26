# M6 answer evidence grounding 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m6-answer-evidence-grounding`, `docs/workflows/feature/m6-answer-evidence-grounding`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`
- Escalated context read: `docs/project-context/asklake-week2-module-plan/ver2/README.md`, `main-e2e-path.md`, `revised-nonoverlap-responsibility.md`, `docs/reports/m6-m5-catalog-source-adapter.md`, M6 service/domain/test files
- Context omitted intentionally: real LLM provider, external vector DB/full document RAG, real DuckDB/Trino/Athena adapter, M1 UI rendering implementation
- Changed: `AIQueryResult.evidence`에 optional schema/metric/lineage/retrieval grounding fields를 추가하고, M6 summary가 같은 CatalogMetadata 근거를 말하도록 보강했다. `contracts/ai_query_result.sample.json`과 `docs/03` 계약 설명도 갱신했다.
- Verified: TDD failing-first 확인, focused M6 test `8 passed`, latest-main merge 후 backend tests `45 passed`, compileall, contract JSON parse, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: remote CI rerun 확인과 PR merge/finalize/cleanup
- Next context: M1 AI Query Live UI는 `evidence.schema_fields`, `evidence.metrics`, `evidence.lineage`, `evidence.retrieval_terms`를 optional로 표시할 수 있다.
- Risk: optional field 추가라 기존 소비자는 유지되지만, M1 UI가 새 evidence를 전부 표시하려면 defensive rendering이 필요하다.
