# Week 2 Workflow Catalog 노트

## 진행 메모

- 2026-06-25: `feature/...` branch 생성은 Git ref lock 문제로 실패했다. 기본 branch prefix 규칙에 따라 `codex/week2-workflow-catalog`를 만들고 workspace는 `docs/workflows/feature/week2-workflow-catalog`에 유지했다.
- 2026-06-25: 프로젝트 전용 `.venv`를 생성했고 `.gitignore`에 `.venv/`를 추가했다.
- 2026-06-25: M5 runtime slice는 기존 baseline `PipelineService`를 섞지 않고 `Week2WorkflowService`로 분리했다.
- 2026-06-25: fixture 기반 `ExecutionResult`는 local runner 요청 시 `fallback_succeeded`를 반환하며 Airflow와 같은 response shape를 유지한다.

## 결정

- Week 2 draft route를 `/api/week2/*`로 추가한다. 기존 `/api/pipelines` baseline은 그대로 둔다.
- 실제 Airflow/MinIO 구현 전까지는 `contracts/*.sample.json`을 로드한 in-memory run/catalog slice로 M1/M6 boundary를 검증한다.

## 열린 질문

- 실제 Airflow fallback threshold는 M5 adapter 구현 전 확정해야 한다.
- 실제 MinIO endpoint와 local fallback path는 M3/M5 handoff 전에 확정해야 한다.
- Catalog metadata를 나중에 SQLite metadata store에 persist할지 별도 Week 2 store를 둘지 결정이 필요하다.

## 링크 / 증거

- `backend/app/services/week2_workflow.py`
- `backend/app/api/week2_workflow.py`
- `backend/tests/test_week2_workflow_catalog.py`
- `contracts/workflow_definition.sample.json`
- `contracts/execution_result.sample.json`
- `contracts/catalog_metadata.sample.json`
- `PYTHONPATH=backend ./.venv/bin/pytest backend/tests -q` -> 21 passed
- `scripts/validate-harness.sh --strict` -> passed

## Daily Evidence / 하루 종료 증거

```text
Date: 2026-06-25
Module: M5 Workflow/Catalog
Owner: 이해건
Run ID: run_reviews_demo_001
Executed command or screen: POST /api/week2/workflows/pipeline_reviews_json_e2e/runs
Input source or file: contracts/workflow_definition.sample.json
Output S3/local path: s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/
row_count: TODO: actual demo/fixed/extended sample result
bytes: TODO: actual output size after Parquet write
duration: fixture runtime only
Produced JSON: ExecutionResult, CatalogMetadata
Consumer module: M1, M6
Blocked issue: actual Airflow, Parquet, MinIO persistence not implemented in this slice
Next first action: connect M3 actual output path and row_count to ExecutionResult/CatalogMetadata
```
