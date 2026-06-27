# M2 Taxi scale evidence 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: Taxi runner의 입력 경로 해석, PySpark local mode 실행, row/bytes/duration evidence가 바뀌므로 focused regression test가 필요하다.
- Failing test first: 기존 테스트는 단일 Parquet 파일 중심이었고, PySpark local mode가 Taxi Gold Parquet을 쓰는 증거가 없었다.
- Expected failure command/result: `python3 -m pytest backend/tests/test_week2_taxi_batch_runner.py` -> local system Python에 `pyarrow`가 없어 collection 실패; `backend/tests/test_week2_taxi_spark_runner.py` 초기 실행 -> Spark 4 `TIMESTAMP_NTZ` duration 계산 실패.
- Pass command/result: `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests/test_week2_taxi_batch_runner.py backend/tests/test_week2_taxi_spark_runner.py backend/tests/test_week2_storage_adapter.py -q` -> `6 passed in 5.42s`
- Refactor notes: 기존 pyarrow Taxi runner는 유지하고, PySpark local mode용 `Week2TaxiSparkRunner`를 별도로 추가했다. 여러 Parquet 파일은 pyarrow runner에서 파일별로 누적 처리하고, Spark runner는 작은 smoke와 5GB 재실행 경로를 담당한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | no output |
| dependency install | `.venv/bin/python -m pip install pyspark==4.1.2` | passed | installed `pyspark 4.1.2`, `py4j 0.10.9.9` |
| PySpark install smoke | `SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python - <<'PY' ... SparkSession.builder.master('local[1]') ... PY` | passed | Spark `4.1.2`, `rows=3` |
| unit/focused test | `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests/test_week2_taxi_batch_runner.py backend/tests/test_week2_taxi_spark_runner.py backend/tests/test_week2_storage_adapter.py -q` | passed | `6 passed in 5.42s` |
| integration/contract test | `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_taxi_spark_runner.py -q` | passed | `21 passed in 6.18s` |
| backend full test | `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests -q` | passed | `67 passed in 7.14s` |
| build/typecheck | `PYTHONPATH=backend .venv/bin/python -m py_compile backend/app/services/week2_taxi_spark_runner.py scripts/week2_m2_taxi_spark_local_evidence.py backend/app/services/week2_taxi_batch_runner.py backend/app/services/week2_local_runner.py` | passed | no output |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## Manual Evidence / 수동 실행 증거

| Evidence | Command | Result | Notes |
| --- | --- | --- | --- |
| TLC direct download probe | `curl -L --fail ... https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet` | failed | CLI GET이 `403`으로 차단됨 |
| S3 fallback probe | `curl -L ... https://nyc-tlc.s3.amazonaws.com/...` | failed | S3 endpoint도 `403`으로 차단됨 |
| local full-month smoke | `PYTHONPATH=backend .venv/bin/python scripts/week2_m2_taxi_local_batch_evidence.py --input /Users/liamtsy/Downloads/yellow_tripdata_2024-01.parquet --profile local-full-month --run-id run_taxi_2024_01_full_month_scale_smoke_001 --summary-path data/results/m2_taxi_scale_evidence/run_taxi_2024_01_full_month_scale_smoke_001_summary.json` | passed | input `2,964,624 rows`, `49,961,641 bytes`; output `35 rows`, `7,539 bytes`; duration `346ms` |
| Spark local Taxi smoke | `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python scripts/week2_m2_taxi_spark_local_evidence.py --input /Users/liamtsy/Downloads/yellow_tripdata_2024-01.parquet --profile demo --demo-limit 10000 --run-id run_taxi_spark_local_demo_001 --summary-path data/results/m2_taxi_spark_local_evidence/run_taxi_spark_local_demo_001_summary.json` | passed | input `10,000 rows`, `49,961,641 bytes`; output `2 rows`, `4,012 bytes`; duration `6,198ms`; Spark `4.1.2` |
| Spark local + MinIO upload smoke | temp `minio/minio:latest` on `http://localhost:19000`; same CLI with `--minio-upload --auto-create-bucket` | passed | input `10,000 rows`; output `2 rows`, `4,012 bytes`; task `spark_upload_taxi_daily_metrics` succeeded; duration `6,992ms` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, PR checks
- CI result: pending until PR
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| 5GB TLC download/run | 현재 CLI 환경에서 TLC CloudFront와 S3 직접 다운로드가 `403`으로 차단됨. 브라우저로 받은 파일을 로컬 ignored 경로에 둔 뒤 재실행해야 한다. | pending |
| Spark direct `s3a://` write | 이번 smoke는 Spark local write 후 existing storage adapter upload까지 확인했다. Spark가 S3A로 직접 쓰는 경로는 Docker Spark cluster 후속 작업에서 닫는다. | n/a |
| Docker Spark cluster | 이번 작업은 PySpark local mode 우선 검증이다. M2 최종 완료 기준에는 Docker Spark cluster가 필요하므로 후속 단계로 남긴다. | n/a |
