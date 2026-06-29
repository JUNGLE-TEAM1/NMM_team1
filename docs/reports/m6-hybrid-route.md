# M6 Hybrid Route 보고서

짧게 써도 되지만 변경 사항, 검증 결과, 남은 일, 다음 작업 문맥은 반드시 남긴다.

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: M6에 deterministic `QueryRouter`를 추가해 `sql`, `rag`, `hybrid`, `unsupported` route를 분리했다. Hybrid는 SQL rows와 CatalogMetadata evidence를 함께 사용하고, RAG-only는 SQL engine validate/execute를 호출하지 않는다.
- Verified: TDD expected failure, focused route/M6 tests `20 passed`, focused M6 regression `38 passed`, full backend tests `94 passed, 1 skipped`, `jq -e . contracts/*.sample.json`, local API smoke for `hybrid`/`rag`, `git diff --check`, strict harness validation.
- Remaining: PR 생성/CI/merge는 아직 수행하지 않았다. 이 branch는 PR #241 위 stacked branch다. external LLM, real semantic route classifier, M1 richer route display는 후속 Phase다.
- Next context: `docs/workflows/feature/m6-hybrid-route/quality.md`, `docs/03-interface-reference.md`의 M6 Hybrid Route policy, 직전 report `docs/reports/m6-catalog-rag-index.md`.
- Risk: deterministic keyword routing은 MVP용이다. 질문 표현이 다양해지면 route 품질 보강이나 provider-backed classifier가 필요하다.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m6-hybrid-route`, `docs/workflows/feature/m6-hybrid-route`
- Date: 2026-06-29
- Workspace state: ready-for-review

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/reports/m6-catalog-rag-index.md`

## Goal / 목표

- M6가 SQL-only, RAG-only, Hybrid, Unsupported 질문을 구분하고, Hybrid 질문에서는 SQL 결과와 Catalog RAG-lite evidence를 함께 반환한다.

## Changed Files / 변경 파일

- `backend/app/services/query_router.py`
- `backend/app/services/ai_query.py`
- `backend/app/services/catalog_rag_index.py`
- `backend/tests/test_query_router.py`
- `backend/tests/test_week2_ai_query.py`
- `contracts/ai_query_result.sample.json`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/workflows/feature/m6-hybrid-route/*`

## Implementation Summary / 구현 요약

- `QueryRouter`가 질문과 `SqlPlan`을 보고 route를 결정한다.
- SQL metric/ranking 질문은 기존처럼 SQL을 실행하고 `route=sql`을 유지한다.
- SQL 질문이 근거/스키마/라인리지 설명을 함께 요구하면 `route=hybrid`로 SQL 실행 뒤 CatalogMetadata evidence를 summary에 명시한다.
- schema/lineage/catalog 설명 질문은 `route=rag`로 SQL engine을 호출하지 않고 CatalogMetadata summary를 반환한다.
- 예측/미래/매출/감성 등 unsupported 질문은 기존처럼 blocked guardrail을 반환한다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_query_router.py backend/tests/test_week2_ai_query.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_query_router.py backend/tests/test_week2_ai_query.py backend/tests/test_catalog_retrieval_index.py backend/tests/test_sql_planner.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_duckdb_sql_engine.py backend/tests/test_app_container.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q
jq -e . contracts/*.sample.json
curl -fsS -X POST http://127.0.0.1:8000/api/week2/ai/query -H 'Content-Type: application/json' -d '{"question":"리뷰가 가장 많은 상품과 근거를 설명해줘"}'
curl -fsS -X POST http://127.0.0.1:8000/api/week2/ai/query -H 'Content-Type: application/json' -d '{"question":"이 데이터셋의 스키마와 lineage 근거를 알려줘"}'
git diff --check
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m6-hybrid-route/quality.md`
- Quality gate status: passed locally including strict harness validation.
- TDD status: applied. Initial expected failure was missing `app.services.query_router`; final focused result was `20 passed in 0.63s`.
- CI/check result: local checks passed; PR CI not run yet.
- Skipped checks: live M1 browser smoke, external LLM/vector DB smoke.
- CD/deploy gate: not applicable.

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/feature/m6-hybrid-route/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: deterministic `QueryRouter`, RAG-only no-SQL route, Hybrid SQL+CatalogMetadata summary, stacked branch on PR #241. external LLM, real semantic route classifier, M1 richer display are deferred.
- Revisit/rollback condition: route false positives/negatives in representative questions require `QueryRouter` term/test adjustment.

## Regression Guard / 회귀 보호

- Checked feature: M6 route decision, SQL-first execution, RAG-only no-SQL behavior, unsupported guardrail.
- Protected behavior: SQL-only questions remain `route=sql`; unsupported forecast/revenue/sentiment remains blocked; RAG-only does not call SQL engine.
- Result: focused/backend regression passed locally.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Ask route is one of SQL/RAG/Hybrid/Unsupported, retrieval trace explains evidence, RAG-only avoids SQL engine.
- Status: implemented for Step 7 local MVP.
- Evidence: tests and docs/contract updates above.

## Document Updates / 문서 업데이트

- Updated: `docs/03`, `docs/05`, `docs/06`, `docs/07`, `contracts/ai_query_result.sample.json`, branch workspace docs.
- Not updated and why: `docs/02` architecture is unchanged because this uses the existing M6 Ask/Evidence boundary. `README.md` remains a concise external summary.

## Secret / Migration / Env Check

- Secret check: no secret committed.
- Migration/data change: no migration and no data model storage change.
- Env change: no new env var or external dependency.

## Final Judgment / 최종 판단

- Done: Step 7 M6 Hybrid Route implementation is locally complete and ready for PR decision.
- Remaining risk: deterministic keyword routing is intentionally simple and should be revisited when representative question coverage grows.
