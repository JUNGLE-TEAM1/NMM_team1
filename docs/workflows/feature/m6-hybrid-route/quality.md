# M6 Hybrid Route 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: route 결정은 SQL 실행 여부와 RAG-only no-SQL behavior에 직접 영향을 주므로 먼저 regression을 고정해야 한다.
- Failing test first: `backend/tests/test_query_router.py`, `backend/tests/test_week2_ai_query.py`에 SQL/Hybrid/RAG/Unsupported route tests를 먼저 추가했다.
- Expected failure command/result: `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_query_router.py backend/tests/test_week2_ai_query.py -q` -> `ModuleNotFoundError: No module named 'app.services.query_router'`
- Pass command/result: `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_query_router.py backend/tests/test_week2_ai_query.py -q` -> `20 passed in 0.63s`
- Refactor notes: `QueryRouter`를 별도 service로 두어 `SqlPlanner`와 `Week2AIQueryService` 책임을 분리했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| diff whitespace | `git diff --check` | passed | no output |
| unit/focused test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_query_router.py backend/tests/test_week2_ai_query.py -q` | passed | `20 passed in 0.63s` |
| focused M6 regression | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_query_router.py backend/tests/test_week2_ai_query.py backend/tests/test_catalog_retrieval_index.py backend/tests/test_sql_planner.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_duckdb_sql_engine.py backend/tests/test_app_container.py -q` | passed | `38 passed in 0.67s` |
| backend regression test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q` | passed | `94 passed, 1 skipped in 2.14s` |
| contract JSON | `jq -e . contracts/*.sample.json` | passed | all sample JSON parsed |
| local API smoke: hybrid | `curl -fsS -X POST http://127.0.0.1:8000/api/week2/ai/query -H 'Content-Type: application/json' -d '{"question":"리뷰가 가장 많은 상품과 근거를 설명해줘"}'` | passed | `route=hybrid`, SQL rows returned, summary includes CatalogMetadata evidence |
| local API smoke: rag | `curl -fsS -X POST http://127.0.0.1:8000/api/week2/ai/query -H 'Content-Type: application/json' -d '{"question":"이 데이터셋의 스키마와 lineage 근거를 알려줘"}'` | passed | `route=rag`, `sql=""`, `rows=[]`, CatalogMetadata summary returned |
| build/typecheck | n/a | n/a | Python backend has no separate configured typecheck/build gate for this Phase |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: PR CI after PR creation
- CI result: not run yet
- Deploy/publish required: no
- Deployment confirmation: n/a
- Rollback/smoke notes: no deploy or migration. Revert this branch to remove Hybrid/RAG-only route behavior.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| live M1 browser smoke | 이번 Phase는 backend route behavior와 response contract 변경이며 M1 UI 변경이 없다. | n/a |
| external LLM/vector DB smoke | 명시적 범위 제외. deterministic local route만 검증한다. | n/a |
