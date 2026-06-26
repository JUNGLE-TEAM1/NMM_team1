# M6 Catalog retrieval scoring 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m6-catalog-retrieval-scoring`, `docs/workflows/feature/m6-catalog-retrieval-scoring`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Lite Read, M6 retrieval/source boundary 확인을 위해 필요한 Week2 ver2 문맥만 선택적으로 확장
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/12-quality-gates.md`, `docs/15-context-budget-rule.md`, 이 workspace `plan.md`
- Escalated context read: `docs/project-context/asklake-week2-module-plan/ver2/implementation-transition-plan.md`, `main-e2e-path.md`, `revised-nonoverlap-responsibility.md`, 이전 `m6-catalog-source-boundary` report/quality/plan, `backend/app/services/ai_query.py`, `backend/tests/test_week2_ai_query.py`
- Context omitted intentionally: M5 실제 Catalog store/API 구현, M3 TransformSpec 세부 구현, real DuckDB/Trino/Athena adapter, external vector DB/full document RAG/real LLM
- Changed: `CatalogRetriever` 추가, metadata token/column alias scoring 구현, `Week2AIQueryService`가 retriever 결과를 사용하도록 분리, multi-catalog tie-breaking test 추가
- Verified: focused M6 test `6 passed`, backend tests `38 passed`, `python3 -m compileall backend/app`, `jq -e . contracts/*.sample.json`, `git diff --check`, `scripts/validate-harness.sh --strict`
- Remaining: 원격 CI/PR 검증, M5 실제 Catalog source adapter, real SQL runtime adapter, full semantic/vector/LLM 확장 결정
- Next context: M5 Catalog source shape가 안정되면 `CatalogSource` adapter를 실제 store/API로 바꾸고, retriever scoring에 M3 schema/profile facts를 추가한다.
- Risk: 현재 scoring은 lightweight token/alias 기반이다. 발표 기본 범위의 RAG-lite에는 맞지만, real semantic embedding/vector retrieval로 오해하면 안 된다.
