# M2 Taxi 로컬 배치 evidence

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-taxi-local-batch-evidence`, `docs/workflows/feature/m2-taxi-local-batch-evidence`
- Date: 2026-06-27
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`, `docs/workflows/feature/taxi-dataset-bootstrap/notes.md`, `docs/workflows/feature/taxi-dataset-bootstrap/decisions.md`, `docs/workflows/feature/m2-workflow-runner-integration/report.md`, `backend/app/services/week2_spark_runner.py`, `scripts/week2_m2_amazon_reviews_runner_evidence.py`
- Escalated context read: `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/07-manual-verification-playbook.md`
- Context omitted intentionally: PostgreSQL runtime setup, MinIO/S3 runtime, PySpark cluster setup, Airflow DAG internals, M1 UI internals
- Changed: `Week2TaxiBatchRunner`, Taxi local batch evidence CLI, focused backend tests, Week 2 Taxi Gold metric contract note를 추가했다.
- Verified: TDD 실패를 먼저 확인했고, Taxi runner focused test 2개, 전체 backend test 53개, `git diff --check`, fixed Taxi evidence 81,013 rows, full-month Taxi evidence 2,964,624 rows -> Gold daily metric 35 rows 처리를 확인했다.
- Remaining: PostgreSQL loader, MinIO/S3 write, PySpark runner, Airflow DAG invocation, M5 workflow API integration, M6 SQL smoke는 후속 작업이다.
- Next context: storage adapter/MinIO PR 또는 PySpark local mode PR은 `TaxiBatchConfig`, `Week2TaxiBatchRunner` output schema, evidence CLI command shape를 재사용하면 된다.
- Risk: 이번 local full-month evidence는 48MB Parquet 한 달 파일을 local pyarrow로 처리한 증거이며, GB/TB distributed Spark scale 증거는 아니다. full-month output은 source file의 outlier timestamp 때문에 1월 31일이 아니라 35 pickup dates로 나온다.
