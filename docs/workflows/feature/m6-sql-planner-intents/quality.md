# M6 SQL planner intent rules 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: SQL 생성 규칙을 service 내부 template 분기에서 planner 컴포넌트로 분리하는 변경이며, unsupported 질문이 더 이상 fake/default SQL 성공으로 보이면 안 된다. 2026-06-28에는 최신 대표 path인 `gold_product_health` intent를 추가했으므로 product health regression도 필요하다.
- Failing test first: `backend/tests/test_sql_planner.py`와 M6 service unsupported regression test를 추가한 뒤 focused pytest를 실행한다.
- Expected failure command/result: `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_sql_planner.py backend/tests/test_week2_ai_query.py -q` -> failed with `ModuleNotFoundError: No module named 'app.services.sql_planner'`.
- Pass command/result: focused planner/M6 tests 21 passed; focused planner/M6/DuckDB tests 26 passed; post-rebase full backend tests 82 passed, 1 skipped; harness and strict harness passed.
- Refactor notes: SQL intent/classification and SQL string creation moved into `SqlPlanner`; `Week2AIQueryService` keeps adapter execution and answer assembly; `CatalogRetriever` aliases now include product health metrics.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| TDD expected failure | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_sql_planner.py backend/tests/test_week2_ai_query.py -q` | passed as failure evidence | missing `app.services.sql_planner` before implementation |
| focused planner/M6 test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_sql_planner.py backend/tests/test_week2_ai_query.py -q` | passed | 21 passed after product health update |
| focused M6/DuckDB test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_sql_planner.py backend/tests/test_week2_ai_query.py backend/tests/test_duckdb_sql_engine.py backend/tests/test_week2_ai_query_duckdb.py -q` | passed | 26 passed |
| backend test suite | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q` | passed | 82 passed, 1 skipped |
| lint | `git diff --check` | passed | no whitespace errors |
| contract JSON | `jq -e . contracts/*.sample.json` | passed | all sample contracts parse |
| local API smoke | not rerun after product health update | skipped | no canonical `dataset_product_health_gold` CatalogMetadata/Gold output fixture exists yet; M2 runtime smoke seed inputs exist on main and service/product health behavior is covered by focused tests |
| harness validation | `scripts/validate-harness.sh` | passed | harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | strict harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes after PR creation
- CI result: PR #231 initial body checks were corrected; remote checks are tracked on PR #231
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| PR/remote CI | Runs after PR creation on GitHub. | no |
