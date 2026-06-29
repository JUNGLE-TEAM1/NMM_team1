# M2 Docker Spark MinIO output smoke 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: partial
- Reason: storage adapter와 Taxi Spark runner의 핵심 동작은 기존 테스트가 있어 focused regression으로 확인했다. 이번 branch의 주 변경은 Docker compose/script orchestration이므로 실제 Docker Spark + MinIO smoke를 필수 검증으로 둔다.
- Failing test first: 별도 신규 failing unit test는 만들지 않았다. 이미 존재하는 `Week2StorageAdapter` upload test와 Taxi Spark runner test가 storage/run evidence 회귀를 보호한다.
- Expected failure command/result: sandbox 내부에서 `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests/test_week2_storage_adapter.py backend/tests/test_week2_taxi_spark_runner.py -q` 실행 시 PySpark Py4J gateway가 localhost port bind를 못해 `Operation not permitted`로 실패했다.
- Pass command/result: 같은 명령을 sandbox 밖 권한으로 재실행해 `6 passed in 7.54s`.
- Refactor notes: direct Spark `s3a://` write는 추가하지 않고, 기존 local fallback write 뒤 `Week2StorageAdapter` upload path를 Docker Spark smoke에 연결했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| shell syntax | `bash -n scripts/week2_m2_taxi_spark_docker_evidence.sh` | passed | no output |
| compose config | `docker compose -p asklake_m2_taxi_spark_minio -f docker/m2-taxi-spark-docker-compose.yml config` | passed | `m2-minio`, Spark master/worker/driver, network, volume rendered |
| build/typecheck | `PYTHONPATH=backend .venv/bin/python -m py_compile scripts/week2_m2_taxi_spark_local_evidence.py backend/app/services/week2_taxi_spark_runner.py backend/app/services/week2_storage_adapter.py` | passed | no output |
| lint | `git diff --check` | passed | no output |
| unit/focused test | `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests/test_week2_storage_adapter.py backend/tests/test_week2_taxi_spark_runner.py -q` | passed | sandbox run failed with Py4J local port bind permission; escalated rerun passed `6 passed in 7.54s` |
| integration/backend test | `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests -q` | passed | `95 passed in 6.94s` |
| manual Docker smoke | `ASKLAKE_TAXI_HOST_DIR='/Users/liamtsy/Desktop/asklake_taxi_data copy' scripts/week2_m2_taxi_spark_docker_evidence.sh minio-small` | passed | input `10,000 rows`, `4,442,620 bytes`; output `6 rows`, `4,593 bytes`; duration `5,736ms`; task `spark_upload_taxi_daily_metrics` succeeded; object URI recorded |
| MinIO object presence | `docker exec m2-minio /bin/sh -lc 'ls -l /data/asklake-demo/taxi/gold/daily_metrics/run_id=run_taxi_docker_spark_minio_small_001/gold_taxi_daily_metrics.parquet'` | passed | MinIO object backend metadata `xl.meta` exists under the expected object path |
| Docker cleanup | `scripts/week2_m2_taxi_spark_docker_evidence.sh down`; `docker compose -p asklake_m2_taxi_spark -f docker/m2-taxi-spark-docker-compose.yml ps` | passed | no running containers listed |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, PR checks
- CI result: pending until PR
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: local smoke containers are stopped with `scripts/week2_m2_taxi_spark_docker_evidence.sh down`. The named MinIO volume may persist local smoke object data and can be removed manually only if cleanup is explicitly requested.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| `minio-5gb` | 이번 branch의 필수 검증은 작은 Taxi 입력의 Docker Spark + MinIO path다. 5GB는 같은 script mode로 열어두되 실행 시간이 길어 follow-up evidence로 둔다. | n/a |
| Spark direct `s3a://` write | Hadoop AWS jar/version, MinIO endpoint, credential provider 설정이 필요해 별도 Phase가 맞다. 이번에는 local fallback write 뒤 adapter upload를 검증했다. | n/a |
| AWS S3 real upload | cloud credential/IAM/resource 결정이 없어 local MinIO로만 검증했다. | n/a |
| Product Health 5GB evidence | 입력 데이터와 최종 spec이 아직 준비되지 않아 이 branch 범위에서 제외했다. | n/a |
