# Week 2 Workflow Catalog 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `codex/week2-workflow-catalog`, `docs/workflows/feature/week2-workflow-catalog`
- Date: 2026-06-25
- Workspace state: complete
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/project-context/asklake-week2-module-plan/README.md`, `docs/project-context/asklake-week2-module-plan/decisions.md`, `docs/project-context/asklake-week2-module-plan/plan.md`
- Escalated context read: `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/08-development-workflow.md`, `contracts/workflow_definition.sample.json`, `contracts/execution_result.sample.json`, `contracts/catalog_metadata.sample.json`, backend API/service/container/test files
- Context omitted intentionally: actual Airflow DAG implementation, real Parquet/MinIO write path, M1 UI, M3 JSON normalization, M6 SQL/RAG execution
- Changed: 프로젝트 `.venv/` ignore 추가, Week 2 M5 `Week2WorkflowService`와 `/api/week2` workflow/run/catalog routes 추가, `Week2LocalRunner` runner boundary 추가, focused backend contract tests 추가, workspace evidence 기록
- Verified: `jq -e . contracts/*.sample.json >/dev/null`; `PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_local_runner.py backend/tests/test_week2_workflow_catalog.py -q` -> 6 passed; `PYTHONPATH=backend ./.venv/bin/pytest backend/tests -q` -> 24 passed; `scripts/validate-harness.sh --strict` -> passed
- Remaining: 실제 Airflow adapter, actual Parquet write, MinIO/local fallback path, row_count/bytes/duration 채움, persistent Catalog store 연결은 후속 M5 implementation slice에서 진행
- Next context: M5 다음 작업자는 `Week2LocalRunner.run()` 안쪽을 실제 file/Parquet step 또는 Airflow adapter로 교체하고, M3 output path와 metrics를 `ExecutionResult`/`CatalogMetadata`에 주입한다.
- Risk: `/api/week2/*`는 draft route다. 기존 baseline API를 재사용하는 방향으로 바뀌면 adapter 또는 `docs/03` 갱신이 필요하다.
