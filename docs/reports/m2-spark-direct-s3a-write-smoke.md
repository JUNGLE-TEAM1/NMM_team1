# M2 Spark direct S3A write smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: `Week2TaxiSparkRunner`에 direct S3A output mode를 추가하고, Docker evidence script에 `direct-s3a-small` / `direct-s3a-5gb` mode를 추가했다. `docs/03`, `docs/06`, `docs/07`에는 adapter upload와 direct S3A write의 차이를 반영했다.
- Verified: Docker Spark master/worker/driver와 local MinIO로 작은 Taxi input direct S3A smoke가 성공했다. 입력 `10,000 rows`, `4,442,620 bytes`; output `6 rows`, `4,593 bytes`; duration `23,958ms`; output path `s3a://asklake-demo/taxi/gold/direct_s3a/run_id=run_taxi_docker_spark_direct_s3a_small_001/`.
- Remaining: `direct-s3a-5gb`는 실행하지 않았다. real AWS S3/IAM, Product Health 5GB direct S3A, Airflow DAG 내부 Spark 호출은 후속 작업이다.
- Next context: 같은 script에서 `direct-s3a-5gb`를 실행하면 Taxi 5GB direct S3A evidence를 만들 수 있다. Product Health는 M1/M3의 5GB input/spec 준비 후 같은 S3A 설정을 적용한다.
- Risk: 첫 실행은 Maven에서 `hadoop-aws`와 AWS SDK bundle을 받아야 하므로 네트워크가 필요하다. MinIO smoke는 local object storage 검증이지 AWS 권한 검증이 아니다.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m2-spark-direct-s3a-write`, `docs/workflows/feature/m2-spark-direct-s3a-write`
- Date: 2026-06-29
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/12-quality-gates.md`
- `docs/reports/m2-docker-spark-minio-output-smoke.md`
- `tools/product_health_spark_validation.py`

## Goal / 목표

Docker Spark cluster에서 Taxi Gold Parquet 결과를 local fallback 파일로 만든 뒤 업로드하는 경로가 아니라, Spark writer가 `s3a://` output prefix에 직접 쓰는 경로를 검증한다.

## Changed Files / 변경 파일

- `backend/app/services/week2_taxi_spark_runner.py`
- `scripts/week2_m2_taxi_spark_local_evidence.py`
- `scripts/week2_m2_taxi_spark_docker_evidence.sh`
- `backend/tests/test_week2_taxi_spark_s3a_config.py`
- `docs/03-interface-reference.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- `TaxiSparkConfig.direct_s3a_output_uri`가 있으면 `Week2TaxiSparkRunner`가 Gold DataFrame을 단일 local Parquet 파일로 정리하지 않고 Spark Parquet directory로 직접 쓴다.
- S3A credential은 환경 변수 이름으로만 받고, 실제 secret 값은 코드나 문서에 저장하지 않는다.
- Docker script는 `--packages org.apache.hadoop:hadoop-aws:3.4.1,software.amazon.awssdk:bundle:2.24.6`를 Spark submit에 붙여 공개 Spark image에 없는 S3A connector를 실행 시점에 공급한다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_taxi_spark_s3a_config.py backend/tests/test_week2_taxi_spark_runner.py -q
bash -n scripts/week2_m2_taxi_spark_docker_evidence.sh
PYTHONPATH=backend .venv/bin/python -m py_compile scripts/week2_m2_taxi_spark_local_evidence.py backend/app/services/week2_taxi_spark_runner.py
docker compose -p asklake_m2_taxi_spark -f docker/m2-taxi-spark-docker-compose.yml config
ASKLAKE_TAXI_HOST_DIR='/Users/liamtsy/Desktop/asklake_taxi_data copy' scripts/week2_m2_taxi_spark_docker_evidence.sh direct-s3a-small
PYTHONPATH=backend .venv/bin/python -m json.tool data/results/m2_taxi_spark_docker_evidence/run_taxi_docker_spark_direct_s3a_small_001_summary.json
docker exec m2-minio /bin/sh -lc 'ls -la /data/asklake-demo/taxi/gold/direct_s3a/run_id=run_taxi_docker_spark_direct_s3a_small_001; ls -la /data/asklake-demo/taxi/gold/direct_s3a/run_id=run_taxi_docker_spark_direct_s3a_small_001/*'
scripts/week2_m2_taxi_spark_docker_evidence.sh down
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m2-spark-direct-s3a-write/quality.md`
- Quality gate status: passed
- TDD status: applies
- CI/check result: focused tests and manual Docker smoke passed locally; PR CI is required after PR creation.
- Skipped checks: `direct-s3a-5gb`, real AWS S3/IAM, Product Health 5GB direct S3A.
- CD/deploy gate: not required

## Regression Guard / 회귀 보호

- Checked feature: S3-compatible storage path와 direct S3A write boundary
- Protected behavior: adapter upload smoke와 direct Spark write smoke는 섞이지 않고, secret 값은 env에서만 읽는다.
- Result: focused config tests and direct Docker smoke passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md`
- Environment: Docker Spark `apache/spark:4.0.1`, local MinIO, local Taxi small Parquet.
- Result: direct S3A output summary and MinIO object presence confirmed.
- Failure/limitation: first S3A run downloads Hadoop AWS packages from Maven; real AWS is not verified.
- Evidence: `data/results/m2_taxi_spark_docker_evidence/run_taxi_docker_spark_direct_s3a_small_001_summary.json` local generated artifact, not committed.

## Failed / Incomplete / Follow-Up TODO

- Run `direct-s3a-5gb` after deciding whether Taxi 5GB direct S3A evidence is needed before Product Health evidence.
- Apply the same S3A setup to Product Health 5GB once M1/M3 input/spec are ready.
- Decide whether to bake Hadoop AWS jars into a project Spark image or keep Maven package download at submit time.

## Secret / Migration / Env Check

- Secret check: no secret values committed. MinIO demo credentials are environment defaults in Docker smoke only.
- Migration/data change: no migration. Generated `data/results/` artifacts remain gitignored.
- Env change: Docker, Maven access for first S3A package download, local Taxi directory, local MinIO ports `19000/19001`.

## Final Judgment / 최종 판단

- Done: Docker Spark direct `s3a://` write smoke is implemented and verified on small Taxi input.
- Remaining risk: 5GB direct S3A and real AWS S3/IAM are still unverified.
