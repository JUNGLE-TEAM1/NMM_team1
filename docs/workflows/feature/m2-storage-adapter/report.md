# M2 MinIO S3-compatible storage adapter 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-storage-adapter`, `docs/workflows/feature/m2-storage-adapter`
- Date: 2026-06-27
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`, `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`
- Escalated context read: `docs/02-architecture.md`, `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `RuntimeConfig`, `Week2SparkRunner`, `Week2WorkflowService`, related Week2 tests
- Context omitted intentionally: real MinIO server setup, AWS S3 credentials/IAM/region, PySpark cluster setup, M3 TransformSpec implementation, M5 Airflow DAG internals, M6 SQL engine implementation
- Changed: `StorageConfig`, `Week2StorageAdapter`, SparkRunner storage output location, Workflow Catalog storage metadata mapping, Week2 storage contract fixtures/docs를 추가 또는 갱신했다.
- Verified: TDD 실패를 먼저 확인했고, focused storage/spark tests 4개, Week2 workflow contract tests 포함 20개, 전체 backend tests 55개, JSON fixture validation, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, manual spark_runner smoke를 통과했다.
- Remaining: 실제 MinIO object upload, AWS S3 연결, PySpark distributed execution, M3 TransformSpec/quality rule 처리, M5 Airflow DAG 내부 Spark 호출, M6 SQL smoke는 후속 작업이다.
- Next context: storage adapter가 merge되면 다음 M2 후보는 PySpark local mode 또는 SQL runtime smoke다. 둘 다 `RuntimeConfig.storage`와 `Week2StorageAdapter`의 output path를 재사용해야 한다.
- Risk: 이번 PR은 S3-compatible URI와 local fallback path 계약을 고정하지만 실제 MinIO endpoint에 object를 올리지는 않는다. endpoint/bucket 생성은 후속 실행 승인이 필요하다.
