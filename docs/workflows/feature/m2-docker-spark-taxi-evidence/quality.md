# M2 Docker Spark Taxi evidence 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: yes
- Reason: Docker Spark cluster master에서는 local mode처럼 `SPARK_LOCAL_IP=127.0.0.1`을 강제하면 worker가 driver를 찾지 못한다.
- Failing test first: Docker smoke가 `UnknownHostException: m2-spark-driver`로 실패했고, cluster master에서 local IP를 강제하지 않는 test를 추가했다.
- Expected failure command/result: first Docker small smoke failed before Spark submit completed.
- Pass command/result: focused Taxi Spark tests pass; Docker small and 5GB smoke pass.
- Refactor notes: local master일 때만 `SPARK_LOCAL_IP` 기본값을 둔다. `spark://` master는 Docker hostname/alias를 사용한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | no whitespace errors |
| unit/focused test | `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests/test_week2_taxi_spark_runner.py -q` | passed | `4 passed in 7.31s` |
| integration/contract test | `ASKLAKE_TAXI_HOST_DIR='/Users/liamtsy/Desktop/asklake_taxi_data copy' scripts/week2_m2_taxi_spark_docker_evidence.sh small` | passed | input `10,000 rows`, `4,442,620 bytes`; output `6 rows`, `4,593 bytes`; duration `8,578ms`; Spark master `spark://m2-spark-master:7077` |
| integration/contract test | `ASKLAKE_TAXI_HOST_DIR='/Users/liamtsy/Desktop/asklake_taxi_data copy' scripts/week2_m2_taxi_spark_docker_evidence.sh 5gb` | passed | input `308,010,490 rows`, `4,871,531,583 bytes`; output `2,608 rows`, `225,261 bytes`; duration `105,872ms` |
| integration/readback test | `.venv/bin/python - <<'PY' ... pyarrow.parquet.read_table(...)` | passed-with-warning | both output Parquet files read successfully; pyarrow emitted macOS sandbox CPU info warnings only |
| build/typecheck | `PYTHONPATH=backend .venv/bin/python -m py_compile backend/app/services/week2_taxi_spark_runner.py backend/app/services/week2_storage_adapter.py scripts/week2_m2_taxi_spark_local_evidence.py` | passed | no compile errors |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, after PR
- CI result: blocked until GitHub PR automation/auth is restored
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: `scripts/week2_m2_taxi_spark_docker_evidence.sh down` removes the local Docker Spark cluster after evidence runs.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| Airflow DAG invocation | 이번 branch는 Docker Spark runner evidence만 다룬다. | user-directed scope |
| Product Health 5GB representative path | M1/M3 final input/spec 준비 뒤 별도 실행한다. | user-directed scope |
| MinIO/S3 durable write | 이번 branch는 Docker cluster execution path만 검증한다. | user-directed scope |
