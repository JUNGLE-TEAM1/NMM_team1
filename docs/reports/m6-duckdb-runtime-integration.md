# M6 DuckDB runtime integration 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-27
- Changed: M6 Step 3로 backend runtime 기본 SQL engine을 `DuckDBSqlEngine`으로 전환했다. `WEEK2_SQL_ENGINE=fake` 또는 test settings로 fake engine을 명시 선택할 수 있게 했고, Week2 workflow output 기반 AI query tests가 `query_result.engine="duckdb"`와 실제 output row를 확인하도록 보강했다.
- Verified: TDD expected failure first; focused `backend/tests/test_app_container.py backend/tests/test_week2_ai_query.py backend/tests/test_duckdb_sql_engine.py` passed with 17 tests; full `backend/tests` passed with 66 tests; `git diff --check`; `jq -e . contracts/*.sample.json`; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`; local API smoke returned `query_result.engine="duckdb"` with top rating row `B003`.
- Remaining: SQL planner/intent 강화, public `route`/`retrieval_trace`, Catalog RAG index, hybrid query, external LLM 답변 생성은 후속 M6 steps로 남긴다.
- Next context: 다음 M6 작업은 DuckDB-backed SQL MVP 위에서 질문 intent별 SQL planner와 unsupported/blocked route를 정교화한다.
- Risk: Week2 local runner가 아직 실행되지 않아 `CatalogMetadata.storage.local_fallback_path` output file이 없으면 DuckDB guardrail이 blocked를 반환한다. 이는 fake 성공을 막기 위한 의도된 동작이다.

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m6-duckdb-runtime-integration`, `docs/workflows/feature/m6-duckdb-runtime-integration`
- Date: 2026-06-27
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`

## Verification Commands / 검증 명령

```bash
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_app_container.py backend/tests/test_week2_ai_query.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_app_container.py backend/tests/test_week2_ai_query.py backend/tests/test_duckdb_sql_engine.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q
git diff --check
jq -e . contracts/*.sample.json
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
curl -fsS -X POST http://127.0.0.1:8000/api/week2/ai/query -H 'Content-Type: application/json' -d '{"question":"Amazon reviews에서 평점 높은 상품 알려줘"}'
```

## Regression Guard / 회귀 보호

- Checked feature: M6 Ask/Evidence and Week2 processing integrity.
- Protected behavior: evidence/output file 없이 fake row가 성공처럼 표시되지 않는다.
- Result: passed. Real local output rows were returned by DuckDB and the fake `review_count=42` row was not used in default runtime tests.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` Week2 contract + Ask/Evidence 점검 관련 항목.
- Environment: local backend `127.0.0.1:8000`, frontend Vite `127.0.0.1:5173`.
- Result: passed. `/api/week2/ai/query` returned `query_result.engine="duckdb"` and rows `B003`, `B001`, `B002` from `dataset_reviews_gold.jsonl`.
- Failure/limitation: Docker Compose smoke was not run locally in this Phase.
- Evidence: workspace `quality.md` and local API smoke output.

## Final Judgment / 최종 판단

- Done: yes.
- Remaining risk: generated Week2 output must exist before a demo query; otherwise blocked is expected.
