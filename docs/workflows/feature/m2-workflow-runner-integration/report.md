# M2 Workflow runner 연동 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-workflow-runner-integration`, `docs/workflows/feature/m2-workflow-runner-integration`
- Date: 2026-06-27
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/03-interface-reference.md`, `docs/workflows/feature/m2-amazon-reviews-runner-evidence/report.md`, `docs/workflows/feature/week2-workflow-catalog/report.md`, `backend/app/services/week2_workflow.py`, `backend/app/services/week2_spark_runner.py`, `backend/tests/test_week2_workflow_catalog.py`
- Escalated context read: `contracts/runtime_config.sample.json`, `contracts/workflow_definition.sample.json`, `contracts/execution_result.sample.json`, `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- Context omitted intentionally: M1 UI internals, M3 transform implementation internals, Airflow DAG implementation, Taxi benchmark implementation
- Changed: `executor=spark_runner` API request support, `Week2WorkflowService` direct `Week2SparkRunner` execution path, spark `RuntimeConfig` derivation from `SourceConfig`/`WorkflowDefinition`, Parquet catalog path evidence test, and related Week 2 contract docs.
- Verified: failing test first (`spark_runner` rejected with 422), focused workflow test 16 passed, workflow+spark tests 17 passed, full backend tests 50 passed, Week 2 contract JSON validation passed, `git diff --check` passed, `scripts/validate-harness.sh` passed, `scripts/validate-harness.sh --strict` passed.
- Remaining: PR/CI not run yet. Airflow DAG-internal Spark execution, real distributed Spark cluster, M3 TransformSpec execution, MinIO/S3 write, Taxi evidence remain follow-up work.
- Next context: after commit/PR, M1 can call the existing Week 2 workflow route with `executor=spark_runner`; M5 can decide later whether Airflow invokes the same runner internally.
- Risk: `spark_runner` output is local Parquet boundary evidence. It does not prove Airflow DAG execution or GB/TB distributed Spark scale.

## 실행 경로

이번 branch에서 여는 경로는 아래와 같다.

```text
POST /api/week2/workflows/pipeline_reviews_json_e2e/runs
body.executor = spark_runner
-> Week2WorkflowService
-> RuntimeConfig 생성
-> Week2SparkRunner 실행
-> local Parquet output 생성
-> ExecutionResult / CatalogMetadata 저장
```

이번 branch에서 열지 않는 경로는 아래와 같다.

```text
Airflow DAG 내부에서 SparkRunner 호출
M3 TransformSpec 실행
Taxi 대용량 batch 처리
MinIO/S3 실제 object write
```
