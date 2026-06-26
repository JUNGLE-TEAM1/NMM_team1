# M2 RuntimeConfig SparkRunner smoke 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: `RuntimeConfig`와 runner result shape는 M2/M5 공유 경계라 회귀 위험이 있다.
- Failing test first: `backend/tests/test_week2_spark_runner.py`
- Expected failure command/result: `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_spark_runner.py -q` -> failed, `ModuleNotFoundError: No module named 'pyarrow'`
- Pass command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` -> 1 passed
- Refactor notes: Taxi 전용 logic 없이 `RuntimeConfig`와 `Week2SparkRunner`를 분리했다. 실제 Spark cluster 연결은 후속 PR로 남겼다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | whitespace/check diff clean |
| unit/focused test | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` | passed | 1 passed |
| integration/contract test | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_local_runner.py backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_spark_runner.py -q` | passed | 15 passed |
| backend regression | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q` | passed | 45 passed after `origin/main` sync |
| PR guardrail tests | `node tests/pr-linked-issue-check.test.js`; `node tests/pr-risk-warning.test.js`; `node tests/migration-schema-security-check.test.js`; `node tests/pr-size-hard-gate.test.js` | passed | all PR guardrail tests passed after `origin/main` sync |
| shell syntax | `bash -n scripts/start-workflow.sh scripts/status-workflow.sh scripts/validate-harness.sh scripts/prepare-pr.sh scripts/harness-flow-check.sh` | passed | no syntax errors |
| contract JSON parse | `python3 -m json.tool contracts/runtime_config.sample.json` | passed | valid JSON |
| manual verification review | `rg -n "Week 2|RuntimeConfig|SparkRunner|runner|Parquet|row count|bytes|duration|output path|수동|Manual" docs/07-manual-verification-playbook.md docs/manual-verification -S` | passed | relevant `docs/07` Target MVP item maps to output path, row count, bytes, duration evidence; no UI manual run in this PR |
| backend container build | `docker build -f infra/docker/backend.Dockerfile -t asklake-backend:m2-spark-runner-smoke .` | passed | Python 3.12 image installed `pyarrow==18.1.0` successfully |
| backend container smoke test | `docker run --rm asklake-backend:m2-spark-runner-smoke python -m pytest tests/test_week2_spark_runner.py -q` | passed | 1 passed |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed; current workspace skipped completion-only semantic checks because state is draft |
| harness regression | `scripts/test-harness.sh` | passed | Harness regression tests passed: 31 |

## CI/CD Gate / CI-CD 게이트

- CI required: yes for PR
- CI result: local equivalent passed; remote PR CI not run yet
- Deploy/publish required: no
- Deployment confirmation: not needed
- Rollback/smoke notes: no deploy or persistent data migration

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| real Spark cluster execution | 첫 PR 범위는 Spark-compatible runner boundary와 local Parquet smoke다. Spark cluster wiring은 후속 PR. | scope confirmed by user request to proceed |
| Taxi full-month benchmark | 첫 PR 범위 제외. 대용량 Taxi evidence는 후속 후보. | scope confirmed by workspace plan |
