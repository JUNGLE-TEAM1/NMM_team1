# M6 M5 CatalogSource adapter 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M6 AI query가 fixture catalog 대신 M5 catalog store의 최신 metadata를 우선 사용해야 하는 integration boundary 변경이다.
- Failing test first: `test_week2_ai_query_uses_latest_m5_catalog_after_workflow_runs`
- Expected failure command/result: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` -> `1 failed, 6 passed`; AI query evidence가 두 번째 M5 workflow run의 `run_reviews_demo_002`가 아니라 fixture `run_reviews_demo_001`을 반환.
- Pass command/result: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` -> `7 passed`
- Refactor notes: `Week2CatalogStoreSource` adapter를 추가하고 app container에서 M5 workflow service와 M6 AI query service가 같은 `Week2CatalogStore`를 공유하도록 wiring했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | whitespace diff check passed |
| unit/focused test | `PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` | passed | `7 passed` |
| integration/contract test | `PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests -q` | passed | `39 passed` |
| build/typecheck | `/private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m compileall backend/app` | passed | compileall passed |
| contract fixture JSON | `jq -e . contracts/*.sample.json >/dev/null` | passed | all sample JSON valid |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, after PR creation
- CI result: local equivalent passed; remote CI pending PR
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| container smoke | This slice changes backend adapter wiring and is covered by FastAPI route tests; container smoke can run in PR/CI if needed. | n/a |
