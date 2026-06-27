# M2 Taxi local batch evidence 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: Taxi daily metric은 row count, invalid row, output schema가 틀리면 후속 M5/M6 증거가 깨지는 batch core logic이다.
- Failing test first: `backend/tests/test_week2_taxi_batch_runner.py`를 먼저 추가했다.
- Expected failure command/result: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_taxi_batch_runner.py -q` -> failed, `ModuleNotFoundError: No module named 'app.services.week2_taxi_batch_runner'`.
- Pass command/result: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_taxi_batch_runner.py -q` -> 2 passed.
- Refactor notes: Taxi-specific batch logic은 `Week2TaxiBatchRunner`에 두고, CLI는 runner 결과를 evidence JSON으로 감싸는 얇은 wrapper로 유지했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | whitespace error 없음 |
| unit/focused test | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_taxi_batch_runner.py -q` | passed | 2 passed |
| integration/contract test | `PYTHONPATH=backend .venv/bin/pytest backend/tests -q` | passed | 53 passed |
| local fixed evidence | `.venv/bin/python scripts/week2_m2_taxi_local_batch_evidence.py --input /Users/liamtsy/Downloads/yellow_tripdata_2024-01.parquet --profile fixed --fixed-date 2024-01-01 --run-id run_taxi_2024_01_fixed_001 --output-root data/results/m2_taxi_local_batch_evidence --summary-path data/results/m2_taxi_local_batch_evidence/run_taxi_2024_01_fixed_001_summary.json` | passed | input 81,013 rows / 49,961,641 bytes -> Gold 1 row / 4,220 bytes / 251 ms |
| local full-month evidence | `.venv/bin/python scripts/week2_m2_taxi_local_batch_evidence.py --input /Users/liamtsy/Downloads/yellow_tripdata_2024-01.parquet --profile local-full-month --run-id run_taxi_2024_01_full_month_001 --output-root data/results/m2_taxi_local_batch_evidence --summary-path data/results/m2_taxi_local_batch_evidence/run_taxi_2024_01_full_month_001_summary.json` | passed | input 2,964,624 rows / 49,961,641 bytes -> Gold 35 rows / 7,539 bytes / 238 ms |
| build/typecheck | not run | skipped | Python test suite covers this backend/script change; frontend 변경 없음 |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, when PR opens
- CI result: not run yet
- Deploy/publish required: no
- Deployment confirmation:
- Rollback/smoke notes:

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| frontend build | frontend/UI 변경 없음 | n/a |
| PostgreSQL loader smoke | 이번 PR은 local Parquet evidence로 제한하고 DB loader는 후속 PR로 분리 | n/a |
| MinIO/S3 write | storage adapter 단계에서 진행 | n/a |
| PySpark/distributed Spark | local evidence가 먼저이며 Spark engine 전환은 후속 PR | n/a |
| Airflow DAG invocation | M5 orchestration integration 단계에서 진행 | n/a |
