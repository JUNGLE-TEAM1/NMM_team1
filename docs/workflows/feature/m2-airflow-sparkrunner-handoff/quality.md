# M2 Airflow SparkRunner handoff 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M5 adapter가 M2 artifact를 읽는 integration boundary를 추가하는 작업이므로, artifact shape 회귀를 테스트로 먼저 고정한다.
- Failing test first: `backend/tests/test_week2_airflow_sparkrunner_handoff.py`를 먼저 추가했다.
- Expected failure command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_airflow_sparkrunner_handoff.py -q` -> `ModuleNotFoundError: No module named 'scripts.week2_m2_airflow_sparkrunner_handoff'`
- Pass command/result: 같은 명령 -> `1 passed`
- Refactor notes: Airflow DAG 내부 import 대신 CLI artifact handoff로 경계를 얇게 유지했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | no whitespace error |
| unit/focused test | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_airflow_sparkrunner_handoff.py -q` | passed | `1 passed` |
| integration/contract test | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_airflow_sparkrunner_handoff.py backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_workflow_catalog.py -q` | passed | `22 passed` |
| contract JSON | `jq -e . contracts/runtime_config.sample.json` | passed | valid JSON |
| build/typecheck | `PYTHONPATH=backend .venv/bin/python -m py_compile scripts/week2_m2_airflow_sparkrunner_handoff.py backend/app/services/week2_airflow_adapter.py backend/app/services/week2_spark_runner.py` | passed | no compile error |
| manual smoke | `PYTHONPATH=backend .venv/bin/python scripts/week2_m2_airflow_sparkrunner_handoff.py --runtime-profile airflow_sparkrunner_handoff --run-id run_airflow_spark_001 --result-path data/week2/_airflow_results/run_airflow_spark_001.json` | passed | `week2_result.status=succeeded`, input 4 rows/580 bytes, output 4 rows/1898 bytes |
| backend full test | `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests -q` | passed | `96 passed`; sandboxed run failed on PySpark local port bind, escalated local run passed |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, PR 생성 후 GitHub Actions
- CI result: pending
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| Real Airflow container smoke | 이번 M2 slice는 Airflow service/DAG 구현이 아니라 M5가 호출 가능한 artifact CLI 제공 범위다. M5 PR에서 end-to-end로 확인한다. | 사용자 요청 범위상 M2 handoff 먼저 진행 |
| Spark direct `s3a://` write | 다음 Phase로 분리한다. | 사용자 요청에서 두 번째 작업으로 지정 |
