# M2 Docker Spark MinIO output smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-docker-spark-minio-output-smoke`, `docs/workflows/feature/m2-docker-spark-minio-output-smoke`
- Date: 2026-06-29
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/03-interface-reference.md`, `docs/07-manual-verification-playbook.md`, current M2 Spark/storage scripts
- Escalated context read: `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, previous M2 MinIO/Taxi evidence workspaces
- Context omitted intentionally: AWS S3/IAM docs, Spark `s3a://` Hadoop connector docs, M5 Airflow DAG internals, Product Health final spec internals
- Changed: M2 Taxi Spark evidence compose에 `m2-minio` service를 추가하고, Docker Spark script에 `minio-small`, `minio-5gb`, `minio-up` mode를 추가했다. Taxi Spark evidence summary는 storage 설정이 있을 때 resolved `prefix`, `s3_uri`, `object_uri`를 남긴다.
- Verified: Docker Spark cluster + MinIO smoke가 작은 Taxi 입력으로 성공했고, `spark_upload_taxi_daily_metrics` task, input/output rows/bytes, duration, local output path, S3-compatible object URI가 summary에 남았다. Focused tests, full backend tests, harness validation도 통과했다.
- Remaining: Product Health 5GB 대표 경로, Spark direct `s3a://` write, AWS S3 real upload, Airflow DAG 내부 Spark 호출은 후속이다.
- Next context: Product Health 입력/spec이 준비되면 Taxi supporting evidence가 아니라 `gold_product_health` 대표 경로에서 같은 storage evidence를 다시 실행한다.
- Risk: MinIO service는 M2 evidence compose 전용이다. 기본 앱 compose에는 추가하지 않았다. local smoke에서는 demo credential 기본값을 쓰지만 실제 secret 값은 commit하지 않는다.

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

Docker Spark standalone 실행 경로에서 Taxi Parquet을 읽고 Gold Parquet을 만든 뒤, 그 결과 파일을 MinIO/S3-compatible object path로 업로드하는 smoke를 재현 가능하게 만든다.

## Changed Files / 변경 파일

- `docker/m2-taxi-spark-docker-compose.yml`
- `scripts/week2_m2_taxi_spark_docker_evidence.sh`
- `scripts/week2_m2_taxi_spark_local_evidence.py`
- `docs/03-interface-reference.md`
- `docs/07-manual-verification-playbook.md`

## Implementation Summary / 구현 요약

`docker/m2-taxi-spark-docker-compose.yml`에 `m2-minio` service를 추가했다. 이 service는 M2 Taxi Spark evidence 전용 compose에만 붙고, 기본 앱 compose는 건드리지 않는다.

`scripts/week2_m2_taxi_spark_docker_evidence.sh`에는 `minio-small`, `minio-5gb`, `minio-up` mode를 추가했다. `minio-small`은 Spark master/worker/driver와 MinIO를 같은 Docker network에 띄우고, driver container 안에서 `--minio-upload`를 켜서 local fallback Parquet 생성 뒤 `Week2StorageAdapter` upload를 실행한다.

Taxi Spark evidence JSON은 storage 설정이 있을 때 resolved `prefix`, `s3_uri`, `object_uri`를 남기도록 보강했다.

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

- Docker Spark + MinIO small smoke: input `10,000 rows`, `4,442,620 bytes`; output `6 rows`, `4,593 bytes`; duration `5,736ms`.
- Summary output includes `s3_uri=s3://asklake-demo/taxi/gold/daily_metrics/run_id=run_taxi_docker_spark_minio_small_001/`.
- Summary output includes `object_uri=s3://asklake-demo/taxi/gold/daily_metrics/run_id=run_taxi_docker_spark_minio_small_001/gold_taxi_daily_metrics.parquet`.
- `spark_upload_taxi_daily_metrics` task succeeded with bytes `4,593`.
- MinIO container object path existed under `/data/asklake-demo/taxi/gold/daily_metrics/run_id=run_taxi_docker_spark_minio_small_001/gold_taxi_daily_metrics.parquet`.

## Failed / Incomplete / Follow-Up TODO

- Product Health 5GB representative evidence remains pending on M1/M3 input/spec readiness.
- Spark direct `s3a://` write is not implemented. This branch proves local fallback write plus S3-compatible object upload through `Week2StorageAdapter`.
- AWS S3 real upload is not tested because cloud credential/IAM/resource decisions are outside this Phase.
- Airflow DAG-internal Spark invocation remains M5 integration follow-up.

## Secret / Migration / Env Check

- Secret check: no credential committed. Compose/script use env names and local demo defaults only.
- Migration/data change: no migration. Smoke output under `data/results/` is gitignored; MinIO smoke object is local Docker volume data.
- Env change: Docker, local Taxi directory, and optional MinIO host ports `19000/19001` are required for this manual smoke.

## Final Judgment / 최종 판단

- Done: Docker Spark + local MinIO S3-compatible upload smoke is implemented and verified on small Taxi input.
- Remaining risk: The Week 2 representative Product Health 5GB path still needs its own storage evidence when input/spec are ready.
