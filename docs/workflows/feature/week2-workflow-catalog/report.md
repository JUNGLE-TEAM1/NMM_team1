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
- Changed: 프로젝트 `.venv/` ignore 추가, Week 2 M5 `Week2WorkflowService`와 `/api/week2` workflow/run/catalog routes 추가, `Week2LocalRunner` runner boundary 추가, local JSONL demo fixture 기반 metrics wiring 추가, catalog latest successful run update guard 추가, `Week2AirflowAdapter` fallback boundary 추가, Week 2 execution metric semantics lock 추가, M2 PR #98 공유 댓글 작성, focused backend contract tests 추가, workspace evidence 기록
- Verified: `jq -e . contracts/*.sample.json`; `PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py -q` -> 12 passed; `PYTHONPATH=backend ./.venv/bin/pytest backend/tests -q` -> 30 passed; evidence run -> `ExecutionResult.row_count=4`, `ExecutionResult.bytes=580`, `CatalogMetadata.metrics.row_count=3`, `CatalogMetadata.metrics.bytes=195`; `scripts/validate-harness.sh --strict` -> passed
- Remaining: 실제 외부 Airflow webserver/scheduler/API 연결, actual Parquet write, MinIO endpoint, persistent Catalog store 연결은 후속 M5 implementation slice에서 진행
- Next context: M5 다음 작업자는 Day 2 smoke evidence(#95)를 남기고, 이후 실제 Airflow 환경 URL/auth/DAG trigger contract가 준비되면 adapter 내부 구현을 연결한다. M3 fixed/extended output이 준비되면 `source_config`와 metrics를 교체한다. Catalog persistence가 필요하면 in-memory store를 SQLite 또는 Week 2 run store로 교체한다.
- Risk: `/api/week2/*`는 draft route다. 기존 baseline API를 재사용하는 방향으로 바뀌면 adapter 또는 `docs/03` 갱신이 필요하다.
