# M2 Docker Spark MinIO output smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: M2 Taxi Docker Spark evidence compose에 `m2-minio` service를 추가하고, Docker evidence script에 `minio-small`, `minio-5gb`, `minio-up` mode를 추가했다. Taxi Spark evidence summary는 storage 설정이 있을 때 resolved `prefix`, `s3_uri`, `object_uri`를 남긴다.
- Verified: Docker Spark + MinIO small smoke가 성공했다. input `10,000 rows`, `4,442,620 bytes`; output `6 rows`, `4,593 bytes`; duration `5,736ms`; `spark_upload_taxi_daily_metrics` task succeeded. Focused tests `6 passed`, backend tests `95 passed`, harness/strict validation passed.
- Remaining: Product Health 5GB representative storage evidence, Spark direct `s3a://` write, AWS S3 real upload, Airflow DAG-internal Spark invocation.
- Next context: Product Health 입력/spec이 준비되면 Taxi supporting evidence가 아니라 `gold_product_health` 대표 경로에서 같은 storage evidence를 다시 실행한다.
- Risk: 이번 smoke는 Spark direct S3 write가 아니라 local fallback write 뒤 `Week2StorageAdapter` upload다. 실제 AWS S3/IAM은 검증하지 않았다.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m2-docker-spark-minio-output-smoke`, `docs/workflows/feature/m2-docker-spark-minio-output-smoke`
- Date: 2026-06-29
- Workspace state: ready-for-review

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`

## Goal / 목표

Docker Spark standalone 실행 경로에서 Taxi Parquet을 읽고 Gold Parquet을 만든 뒤, 같은 결과 파일을 MinIO/S3-compatible object path로 업로드하는 smoke를 재현 가능하게 만든다.

## Changed Files / 변경 파일

- `docker/m2-taxi-spark-docker-compose.yml`
- `scripts/week2_m2_taxi_spark_docker_evidence.sh`
- `scripts/week2_m2_taxi_spark_local_evidence.py`
- `docs/03-interface-reference.md`
- `docs/07-manual-verification-playbook.md`

## Implementation Summary / 구현 요약

`m2-minio` service를 M2 Taxi Spark evidence 전용 compose에 추가했다. 기본 앱 compose는 건드리지 않았다.

Docker evidence script는 `minio-small` mode에서 Spark master/worker/driver와 MinIO를 같은 network에 띄운다. driver는 Taxi Gold Parquet을 local fallback path에 쓰고, 기존 `Week2StorageAdapter`로 같은 파일을 `s3://asklake-demo/...` object path에 업로드한다.

## Verification Commands / 검증 명령

```bash
bash -n scripts/week2_m2_taxi_spark_docker_evidence.sh
docker compose -p asklake_m2_taxi_spark_minio -f docker/m2-taxi-spark-docker-compose.yml config
PYTHONPATH=backend .venv/bin/python -m py_compile scripts/week2_m2_taxi_spark_local_evidence.py backend/app/services/week2_taxi_spark_runner.py backend/app/services/week2_storage_adapter.py
PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests/test_week2_storage_adapter.py backend/tests/test_week2_taxi_spark_runner.py -q
PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests -q
ASKLAKE_TAXI_HOST_DIR='/Users/liamtsy/Desktop/asklake_taxi_data copy' scripts/week2_m2_taxi_spark_docker_evidence.sh minio-small
scripts/week2_m2_taxi_spark_docker_evidence.sh down
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
git diff --check
```

## Manual Verification / 수동 검증

- Summary status: `succeeded`.
- Output object URI: `s3://asklake-demo/taxi/gold/daily_metrics/run_id=run_taxi_docker_spark_minio_small_001/gold_taxi_daily_metrics.parquet`.
- Upload task: `spark_upload_taxi_daily_metrics`, status `succeeded`, bytes `4,593`.
- MinIO object path existed under `/data/asklake-demo/taxi/gold/daily_metrics/run_id=run_taxi_docker_spark_minio_small_001/gold_taxi_daily_metrics.parquet`.
- Smoke containers were stopped after verification.

## Failed / Incomplete / Follow-Up TODO

- Product Health 5GB representative evidence remains pending on input/spec readiness.
- Spark direct `s3a://` write remains a follow-up.
- AWS S3 real upload remains a follow-up after cloud/IAM decision.
- M5 Airflow DAG-internal Spark invocation remains a follow-up.

## Secret / Migration / Env Check

- Secret check: no credential committed.
- Migration/data change: no migration.
- Env change: Docker, local Taxi directory, and local MinIO ports `19000/19001` are used for manual smoke.

## Final Judgment / 최종 판단

- Done: Docker Spark + local MinIO S3-compatible upload smoke is implemented and verified on small Taxi input.
- Remaining risk: Week 2 representative Product Health 5GB path still needs its own storage evidence.
