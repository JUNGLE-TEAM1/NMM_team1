# M6 SQL planner intent rules 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-28
- Changed: M6 Step 4로 `SqlPlanner`를 추가해 질문을 `top_count`, `top_rating`, `top_risk`, `top_negative_review`, `low_conversion`, `top_late_delivery`, `unsupported` 내부 intent로 분리했다. `Week2AIQueryService`는 planner가 만든 SQL만 `SqlEngineAdapter`로 실행하고, 지원하지 않는 질문은 SQL engine 호출 없이 `blocked/unsupported_question`으로 반환한다. `CatalogRetriever` alias도 product health 지표를 선택할 수 있게 보강했다.
- Verified: TDD expected failure first; focused planner/M6 tests 21 passed; focused planner/M6/DuckDB tests 26 passed; post-rebase full backend tests 82 passed, 1 skipped; `git diff --check`; `jq -e . contracts/*.sample.json`; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`.
- Remaining: Public `route`/`retrieval_trace`, CatalogMetadata RAG, hybrid query, external LLM, and canonical `dataset_product_health_gold` CatalogMetadata/Gold output fixture remain later M6 steps.
- Next context: Branch was rebased onto `origin/main` `e1ddef2`; PR #231 is open and ready for final remote checks after force-push.
- Risk: Product health planner support depends on M3/M5-provided CatalogMetadata exposing `risk_score`, `negative_review_rate`, `conversion_rate`, and `late_delivery_rate`; main now has M2 product health runtime smoke seed inputs, but this branch does not create the final product health Gold dataset or CatalogMetadata fixture.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_sql_planner.py backend/tests/test_week2_ai_query.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_sql_planner.py backend/tests/test_week2_ai_query.py backend/tests/test_duckdb_sql_engine.py backend/tests/test_week2_ai_query_duckdb.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q
git diff --check
jq -e . contracts/*.sample.json
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

## Final Judgment / 최종 판단

- Done: yes for local implementation and validation.
- Remaining risk: final product health Gold CatalogMetadata/output fixture is not part of this branch.
