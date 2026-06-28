# M2 product health runtime smoke 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: `RuntimeConfig`와 `Week2SparkRunner` runner contract가 바뀌므로 focused regression test가 필요하다.
- Failing test first: `test_week2_spark_runner_writes_multiple_product_health_sources`
- Expected failure command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` -> failed. `RuntimeConfig`가 단일 `input_format`/`input_path`를 필수로 요구해 `source_inputs[]`를 표현하지 못했다.
- Pass command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` -> 5 passed
- Refactor notes: 기존 단일 입력 경로는 유지하고 `source_inputs[]`가 있을 때만 multi-source pass-through mode로 분기했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| diff check | `git diff --check` | passed | whitespace conflict 없음 |
| unit/focused test | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` | passed | 5 passed |
| CLI smoke | `PYTHONPATH=backend .venv/bin/python scripts/week2_m2_product_health_runtime_smoke.py --summary-path data/results/m2_product_health_runtime_smoke/summary.json` | passed | 4 sources, 11 rows, 1412 input bytes, 6719 output bytes |
| contract JSON validation | `jq -e . contracts/*.sample.json` | passed | runtime_config sample 포함 JSON parse OK |
| backend full tests | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q` | passed with escalation | sandbox에서는 PySpark socket bind 제한으로 Taxi test 실패. 권한 확장 재실행 결과 73 passed |
| compileall | `.venv/bin/python -m compileall backend/app scripts/week2_m2_product_health_runtime_smoke.py` | passed | Python syntax/import compile OK |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, after PR
- CI result: pending PR creation
- Deploy/publish required: no
- Deployment confirmation: not required
- Rollback/smoke notes: revert `source_inputs[]` additions and sample/CLI if runner contract causes integration issue.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| Docker Spark cluster | 이번 PR은 local pass-through runtime smoke이며 Docker Spark는 후속 M2 scale Phase | yes, scope confirmed |
| 5GB input run | sample fixture로 runner shape를 먼저 닫고 scale evidence는 후속으로 분리 | yes, scope confirmed |
| Airflow DAG-internal SparkRunner | M5 Airflow integration 책임과 맞춰야 하는 후속 작업 | yes, scope confirmed |
