# M6 DuckDB runtime integration 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M6 runtime 기본 엔진을 fake에서 DuckDB로 바꾸는 integration-sensitive 변경이다. `/query` smoke가 성공처럼 보여도 실제 output file을 읽지 않으면 회귀를 놓칠 수 있다.
- Failing test first: `backend/tests/test_app_container.py` 또는 Week2 integration test에서 default container engine이 `duckdb`이고, Week2 workflow output 기반 AI query가 `query_result.engine == "duckdb"`를 반환하는지 확인한다.
- Expected failure command/result: `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_app_container.py backend/tests/test_week2_ai_query.py -q` -> 3 failed. Default container and Week2 API query still returned `fake`.
- Pass command/result: focused DuckDB/container/M6 tests passed, full backend tests passed.
- Refactor notes: runtime selection stayed in `AppContainer`; `Week2AIQueryService` still depends only on `SqlEngineAdapter`.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| TDD expected failure | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_app_container.py backend/tests/test_week2_ai_query.py -q` | passed as failure evidence | 3 failed because runtime still returned `fake` |
| focused test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_app_container.py backend/tests/test_week2_ai_query.py backend/tests/test_duckdb_sql_engine.py -q` | passed | 17 passed |
| backend test suite | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q` | passed | 66 passed |
| lint | `git diff --check` | passed | no whitespace errors |
| contract JSON | `jq -e . contracts/*.sample.json` | passed | all sample contracts parse |
| local API smoke | `curl -fsS -X POST http://127.0.0.1:8000/api/week2/ai/query ...` | passed | `query_result.engine` returned `duckdb`; top rating row was `B003`, not fake row |
| harness validation | `scripts/validate-harness.sh` | passed | harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | strict passed after `sources.md` base/source records were filled |

## CI/CD Gate / CI-CD 게이트

- CI required: yes after PR creation
- CI result: not run yet; local PR-ready checks passed
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: local backend was restarted on `127.0.0.1:8000`; frontend Vite remained on `127.0.0.1:5173`.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| Docker Compose/container smoke | This Phase changed backend runtime selection and was verified with local backend/API plus full backend tests; full container smoke can run in PR CI. | no |
