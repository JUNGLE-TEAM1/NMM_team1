# M2 Product Health 실제 L6 실행 증거 생성 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: 새 CLI가 Product Health source evidence, L6 preview output, SQL read smoke를 모두 묶으므로 focused regression이 필요하다.
- Failing test first: `test_product_health_l6_evidence_creates_gold_preview_and_sql_check`
- Expected failure command/result: 첫 실행에서 `run_id` column을 기대값에 반영하지 않아 실패했다.
- Pass command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_product_health_l6_evidence.py -q` passed, 1 passed.
- Refactor notes: 기존 `Week2SparkRunner`는 변경하지 않고 새 evidence CLI와 sample spec만 추가했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| unit/focused test | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_product_health_l6_evidence.py -q` | passed | 1 passed |
| CLI smoke | `.venv/bin/python scripts/week2_m2_product_health_l6_evidence.py` | passed | 11 input rows, 1412 input bytes, 2 output rows, 1084 output bytes, DuckDB row_count 2 |
| contract JSON validation | `jq -e . contracts/*.sample.json` | passed | all contract samples valid JSON |
| focused runner regression | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py backend/tests/test_week2_product_health_l6_evidence.py -q` | passed | 14 passed |
| full backend tests | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests -q` | passed with escalation | sandbox run failed because PySpark local Py4J socket bind was blocked; escalated run passed, 92 passed |
| backend Docker pytest | `docker run --rm asklake-backend:m2-product-health-l6-fix python -m pytest` | passed | 91 passed, 1 skipped |
| build/typecheck | `.venv/bin/python -m compileall backend/app scripts/week2_m2_product_health_l6_evidence.py` | passed | Python syntax/import compile OK |
| diff check | `git diff --check` | passed | no whitespace errors |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, after PR
- CI result: PR #243 첫 `container-smoke` failed because the backend Docker image did not include `scripts/`; `infra/docker/backend.Dockerfile` now copies `scripts`, local Docker pytest passed, and PR #243 remote checks passed after PR body impact fields were corrected.
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| 5GB Product Health input run | 이번 Phase는 작은 L6 실행 증거이며, 5GB 묶음 준비 후 같은 경로로 별도 실행한다. | user approved small-first flow |
| Docker Spark cluster | 로컬 M2 runner evidence를 먼저 닫고 후속 scale/runtime Phase로 남긴다. | user approved small-first flow |
| Airflow DAG 내부 SparkRunner 호출 | M5 연동 범위라 이번 M2 smoke에는 포함하지 않는다. | user approved small-first flow |
| 최종 risk metric semantics | M3 소유이므로 M2가 임의 확정하지 않는다. | user approved M3 ownership context |
