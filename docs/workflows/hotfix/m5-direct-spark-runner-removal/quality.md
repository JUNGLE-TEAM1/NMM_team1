# M5 direct spark_runner 제거 Hotfix 품질 기록

- Quality gate status: passed
- Source Of Truth impact: applied
- Harness test impact: none

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M5 executor 허용값은 API contract와 run/catalog 생성 안전성에 직접 영향을 준다.
- Failing test first: yes
- Expected failure: `spark_runner` 거부 테스트를 먼저 바꾼 뒤 기존 구현에서 2 failures 확인.
- Pass result: focused workflow/catalog test 통과.
- Refactor notes: direct `Week2SparkRunner` wiring만 제거하고 M2 runner smoke 구현은 유지했다.

## Branch Checks / 브랜치 검증

| Command | Result |
| --- | --- |
| `PYTHONPATH=backend /Users/sisu/Projects/jungle/nmm/NMM_team1/.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py -q` | failed as expected, 2 failed / 15 passed before implementation |
| `PYTHONPATH=backend /Users/sisu/Projects/jungle/nmm/NMM_team1/.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py -q` | passed, 17 passed |
| `PYTHONPATH=backend /Users/sisu/Projects/jungle/nmm/NMM_team1/.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_spark_runner.py -q` | passed, 21 passed |
| `python3 -m json.tool contracts/execution_result.sample.json contracts/workflow_definition.sample.json contracts/runtime_config.sample.json` | passed individually |
| `git diff --check` | passed |
| `scripts/validate-harness.sh --strict` | passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes before merge
- CI result: local focused checks and strict harness validation passed; remote PR checks pending
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: revert M5 executor guard/docs if direct `spark_runner` API path is explicitly restored by a later decision.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| Full backend tests | focused API/service contract 변경이라 focused workflow + M2 runner smoke로 우선 검증 | n/a |
| Frontend build | UI 변경 없음 | n/a |
| Docker/Airflow smoke | Airflow DAG 내부 Spark 호출 구현 범위 아님 | n/a |
