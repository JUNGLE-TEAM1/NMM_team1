# M6 Hybrid Route 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m6-hybrid-route`, `docs/workflows/feature/m6-hybrid-route`
- Date: 2026-06-29
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`, `docs/reports/m6-catalog-rag-index.md`
- Escalated context read: route/API/contract/test 영향 때문에 M6 interface, acceptance, regression, manual verification을 함께 확인했다.
- Context omitted intentionally: M1 UI 상세, external LLM/vector DB provider 문서, M2~M5 내부 구현 상세.
- Changed: `QueryRouter`, RAG-only no-SQL behavior, Hybrid SQL+CatalogMetadata summary, route contract/docs/tests.
- Verified: TDD expected failure, focused route/M6 tests, focused M6 regression, full backend tests, contract JSON, local API smoke for `hybrid`/`rag`, diff whitespace, strict harness validation.
- Remaining: PR #273은 생성됐고 merge/finalize/cleanup은 아직 수행하지 않았다. external LLM, real semantic route classifier, M1 richer display는 후속 Phase.
- Next context: `docs/reports/m6-hybrid-route.md`, `docs/workflows/feature/m6-hybrid-route/quality.md`, `docs/03-interface-reference.md`의 M6 Hybrid Route policy.
- Risk: deterministic keyword routing은 MVP용이며 질문 표현이 다양해지면 route 품질 보강이 필요하다.
