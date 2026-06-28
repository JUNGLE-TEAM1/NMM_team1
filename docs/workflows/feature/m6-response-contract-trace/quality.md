# M6 response contract route and retrieval trace 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: `AIQueryResult` public response contract와 unsupported/SQL route behavior를 바꾸므로 regression test가 먼저 필요하다.
- Failing test first: `backend/tests/test_week2_ai_query.py`에 `route`와 `retrieval_trace` assertion을 먼저 추가했다.
- Expected failure command/result: `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_week2_ai_query.py -q` -> expected failure, 기존 `AIQueryResult`에 `route`/`retrieval_trace`가 없어 4 failed, 9 passed.
- Pass command/result: focused M6/SQL/DuckDB tests 26 passed; full backend tests 82 passed, 1 skipped before PR; post-rebase full backend tests 84 passed, 1 skipped; contract JSON, diff check, harness, strict harness passed.
- Refactor notes: route 계산과 trace 생성은 `Week2AIQueryService` helper로 분리했다. SQL planner, DuckDB adapter, Catalog source는 재작성하지 않았다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | no whitespace errors |
| unit/focused test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_week2_ai_query.py backend/tests/test_sql_planner.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_duckdb_sql_engine.py -q` | passed | 26 passed |
| integration/contract test | `jq -e . contracts/*.sample.json` | passed | all sample contracts parse |
| backend test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q` | passed | 84 passed, 1 skipped after rebase onto `origin/main` `abe497e` |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed. |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Strict harness passed after replacing temporary `in progress` status text with allowed complete/passed state and closing confirmations. |

## CI/CD Gate / CI-CD 게이트

- CI required: yes after PR creation
- CI result: pending after PR creation
- Deploy/publish required: no
- Deployment confirmation: backend response contract 변경이며 deploy/publish 작업 없음
- Rollback/smoke notes: 문제가 생기면 `AIQueryResult.route`/`retrieval_trace` field와 docs/contract sample 변경을 함께 되돌린다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| browser smoke | 이번 Phase는 backend API response contract와 docs/test 변경이며 M1 UI를 바꾸지 않는다. | workspace scope |
| PR/remote CI | PR 생성 이후 GitHub에서 실행된다. | workspace scope |
