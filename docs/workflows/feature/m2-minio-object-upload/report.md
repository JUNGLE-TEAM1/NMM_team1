# M2 MinIO 실제 업로드 smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-minio-object-upload`, `docs/workflows/feature/m2-minio-object-upload`
- Date: 2026-06-27
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, `docs/workflows/feature/m2-storage-adapter/report.md`, current `StorageConfig`, `Week2StorageAdapter`, `Week2SparkRunner`, related tests
- Escalated context read: `docs/03-interface-reference.md`, `docs/06-regression-and-failure-scenarios.md`, `contracts/runtime_config.sample.json`
- Context omitted intentionally: AWS S3/IAM docs, Spark cluster setup, M3 TransformSpec internals, M5 Airflow DAG internals, M6 SQL implementation
- Changed: `StorageConfig`에 MinIO upload smoke 설정을 추가하고, `Week2StorageAdapter`에 SigV4 signed PUT upload를 추가했다. `Week2SparkRunner`는 opt-in 옵션이 켜진 경우 local Parquet write 뒤 `spark_upload` task를 기록한다. 실제 MinIO 재현용 CLI와 RuntimeConfig/docs 계약도 갱신했다.
- Verified: TDD 실패를 먼저 확인했고, focused storage/spark tests 6개, workflow catalog 포함 22개, 전체 backend tests 67개, contract JSON validation, CLI syntax, `git diff --check`, `scripts/validate-harness.sh`, 실제 MinIO container upload smoke를 통과했다. strict harness는 quality status 값 수정 후 재실행한다.
- Remaining: strict harness 재실행, PR 생성/CI. AWS S3 production profile, Docker Compose MinIO service, Spark cluster, M3 TransformSpec, M5 Airflow DAG 내부 호출, M6 SQL smoke는 후속 작업이다.
- Next context: 다음 M2 후보는 PySpark local mode 또는 M6가 소비할 SQL runtime smoke다. 이번 branch의 `upload_to_object_storage` 옵션은 M5가 runner selection/Airflow 연결 시 명시적으로 켜야 한다.
- Risk: internal SigV4 helper는 단일 PUT smoke 범위다. multipart upload, AWS STS, IAM role, production S3 policy가 필요하면 SDK 도입을 별도 결정해야 한다.
