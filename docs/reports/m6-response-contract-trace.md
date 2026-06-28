# M6 response contract route and retrieval trace 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-28
- Branch/work location: `feature/m6-response-contract-trace`, `docs/workflows/feature/m6-response-contract-trace`
- Changed: `AIQueryResult`에 `route`와 `retrieval_trace`를 additive field로 추가했다. SQL-first 응답은 `route=sql`, unsupported 질문은 `route=unsupported`를 반환하고, Catalog retrieval score/matched terms/evidence index를 trace로 노출한다. `contracts/ai_query_result.sample.json`과 `docs/03`, `docs/05`, `docs/06`, `docs/07`도 같은 계약으로 갱신했다.
- Verified: TDD expected failure first; focused M6/SQL/DuckDB tests 26 passed; full backend tests 82 passed, 1 skipped before PR; post-rebase full backend tests 84 passed, 1 skipped; `git diff --check`; `jq -e . contracts/*.sample.json`; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`.
- Remaining: remote CI, merge/finalize/cleanup은 아직 진행하지 않았다. `rag`와 `hybrid` route 실행은 후속 단계다.
- Next context: 다음 M6 개발은 Catalog RAG Index 또는 M1 route/trace display follow-up 중 하나를 선택한다. 현재 trace는 CatalogMetadata selection 단위다.
- Risk: route enum에는 `rag`/`hybrid`가 포함됐지만 현재 M6 실행 경로는 SQL/Unsupported만 사용한다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_week2_ai_query.py backend/tests/test_sql_planner.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_duckdb_sql_engine.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q
git diff --check
jq -e . contracts/*.sample.json
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

## Acceptance / Regression / Manual Verification

- Acceptance: Week 2 M6 `AIQueryResult`가 기존 `sql`, `query_result`, `rows`, `summary`, `evidence`를 유지하면서 `route`와 `retrieval_trace`를 제공하는 기준을 추가했다.
- Regression: SQL 응답이 `rag`로 잘못 표시되거나 unsupported 질문이 `sql`로 표시되는 경우를 `docs/06` failure scenario와 `backend/tests/test_week2_ai_query.py` assertions로 막는다.
- Manual verification: `docs/07` product risk AI Query 확인 항목에 `AIQueryResult.route=sql`과 `retrieval_trace[].source_id=dataset_product_health_gold` 확인을 추가했다.

## Secret / Migration / Env Check

- Secret check: secret, token, credential 변경 없음.
- Migration/data change: DB migration 없음. API response additive field와 contract sample만 확장.
- Env change: 없음.

## Final Judgment / 최종 판단

- Done: yes for local implementation and validation.
- Remaining risk: PR/remote CI는 아직 실행하지 않았고, RAG/Hybrid/LLM route 실행은 후속 M6 단계다.
