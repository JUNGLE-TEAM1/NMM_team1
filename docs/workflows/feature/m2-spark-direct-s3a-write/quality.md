# M2 Spark direct s3a write smoke 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: direct S3A write는 credential/env 설정과 output mode 분리가 잘못되면 기존 MinIO adapter upload evidence를 흐릴 수 있으므로 focused config test를 추가했다.
- Failing test first: not captured separately; 작은 Phase 안에서 `backend/tests/test_week2_taxi_spark_s3a_config.py`를 추가하고 구현과 함께 통과시켰다.
- Expected failure command/result: n/a
- Pass command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_taxi_spark_s3a_config.py backend/tests/test_week2_taxi_spark_runner.py -q` passed, `9 passed in 6.41s`.
- Refactor notes: 기존 local fallback single-file output과 adapter upload 경로를 유지하고, direct S3A write는 별도 `direct_s3a_output_uri` mode로 분리했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| shell syntax | `bash -n scripts/week2_m2_taxi_spark_docker_evidence.sh` | passed | syntax ok |
| py compile | `PYTHONPATH=backend .venv/bin/python -m py_compile scripts/week2_m2_taxi_spark_local_evidence.py backend/app/services/week2_taxi_spark_runner.py` | passed | compile ok |
| unit/focused test | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_taxi_spark_s3a_config.py backend/tests/test_week2_taxi_spark_runner.py -q` | passed | `9 passed in 6.41s`; rerun with sandbox escalation because PySpark needs local Py4J socket |
| Docker compose config | `docker compose -p asklake_m2_taxi_spark -f docker/m2-taxi-spark-docker-compose.yml config` | passed | compose config rendered with Spark master, 2 workers, driver, and MinIO |
| manual direct S3A smoke | `ASKLAKE_TAXI_HOST_DIR='/Users/liamtsy/Desktop/asklake_taxi_data copy' scripts/week2_m2_taxi_spark_docker_evidence.sh direct-s3a-small` | passed | input `10,000 rows`, `4,442,620 bytes`; output `6 rows`, `4,593 bytes`; duration `23,958ms`; `spark_direct_s3a_write_taxi_daily_metrics` succeeded |
| summary JSON readback | `PYTHONPATH=backend .venv/bin/python -m json.tool data/results/m2_taxi_spark_docker_evidence/run_taxi_docker_spark_direct_s3a_small_001_summary.json` | passed | summary includes `write_mode=spark_direct_s3a` and `s3a_uri=s3a://asklake-demo/taxi/gold/direct_s3a/run_id=run_taxi_docker_spark_direct_s3a_small_001/` |
| MinIO object presence | `docker exec m2-minio /bin/sh -lc 'ls -la /data/asklake-demo/taxi/gold/direct_s3a/run_id=run_taxi_docker_spark_direct_s3a_small_001; ls -la /data/asklake-demo/taxi/gold/direct_s3a/run_id=run_taxi_docker_spark_direct_s3a_small_001/*'` | passed | `_SUCCESS` and `part-00000-...snappy.parquet` object metadata existed |
| Docker cleanup | `scripts/week2_m2_taxi_spark_docker_evidence.sh down` | passed | Spark/MinIO containers and network removed |
| backend full test | `PYTHONPATH=backend .venv/bin/python -m pytest -q` | passed | `139 passed in 7.80s`; rerun with sandbox escalation because PySpark needs local Py4J socket |
| harness regression | `scripts/test-harness.sh` | passed | `Harness regression tests passed: 31` |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | first run failed only because `sync.md` Pre-Merge result was not recorded; rerun after sync update passed with `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: pending until PR checks run
- Deploy/publish required: no
- Deployment confirmation: n/a
- Rollback/smoke notes: local smoke containers are stopped with `scripts/week2_m2_taxi_spark_docker_evidence.sh down`. Generated `data/results/` summary is gitignored. Named MinIO volume can persist object data and should only be removed with explicit cleanup approval.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| `direct-s3a-5gb` | 이번 PR은 작은 Taxi input으로 direct S3A 경로를 먼저 증명한다. 5GB는 같은 script mode로 열어두고 후속 evidence로 실행한다. | n/a |
| real AWS S3/IAM | cloud credential/IAM/resource 결정이 없어 local MinIO로만 검증했다. | n/a |
| Product Health 5GB direct S3A | M1/M3의 Product Health 5GB input/spec 준비가 선행되어야 한다. | n/a |
| Airflow DAG internal Spark submit | M5 Airflow DAG 구현 책임이며 이번 Phase는 M2 runner/storage smoke다. | n/a |
