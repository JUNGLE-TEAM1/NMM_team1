# M2 Spark direct s3a write smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-spark-direct-s3a-write`, `docs/workflows/feature/m2-spark-direct-s3a-write`
- Date: 2026-06-29
- Workspace state: complete
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/workflows/feature/m2-spark-direct-s3a-write/plan.md`, existing M2 Taxi Spark runner/script/tests
- Escalated context read: `tools/product_health_spark_validation.py`, `docs/03-interface-reference.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, prior M2 MinIO/Docker reports
- Context omitted intentionally: real AWS S3/IAM docs, M5 Airflow DAG internals, Product Health 5GB data preparation internals
- Changed: `Week2TaxiSparkRunner`에 direct S3A output mode를 추가했고, Docker evidence script에 `direct-s3a-small`/`direct-s3a-5gb` mode를 추가했다. 공유 문서와 `docs/reports/m2-spark-direct-s3a-write-smoke.md`도 갱신했다.
- Verified: focused tests `9 passed`, shell/py compile passed, Docker compose config passed, Docker Spark + MinIO `direct-s3a-small` smoke passed. Summary에는 input `10,000 rows`, `4,442,620 bytes`, output `6 rows`, `4,593 bytes`, duration `23,958ms`, `s3a_uri`가 남았다.
- Remaining: 5GB direct S3A, real AWS S3/IAM, Product Health 5GB direct S3A, Airflow DAG 내부 Spark submit은 후속 작업이다.
- Next context: Product Health 5GB input/spec이 준비되면 같은 S3A 설정을 Product Health runner 경로에 적용한다. Taxi 5GB direct evidence가 필요하면 `direct-s3a-5gb`를 먼저 실행한다.
- Risk: 공개 Spark image에는 Hadoop AWS jar가 없어 첫 실행 시 Maven package download가 필요하다. network가 막힌 환경에서는 custom Spark image 또는 jar mount가 필요하다.
