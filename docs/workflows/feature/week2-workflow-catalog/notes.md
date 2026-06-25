# Week 2 Workflow Catalog 노트

## 진행 메모

- 2026-06-25: `feature/...` branch 생성은 Git ref lock 문제로 실패했다. 기본 branch prefix 규칙에 따라 `codex/week2-workflow-catalog`를 만들고 workspace는 `docs/workflows/feature/week2-workflow-catalog`에 유지했다.
- 2026-06-25: 프로젝트 전용 `.venv`를 생성했고 `.gitignore`에 `.venv/`를 추가했다.
- 2026-06-25: M5 runtime slice는 기존 baseline `PipelineService`를 섞지 않고 `Week2WorkflowService`로 분리했다.
- 2026-06-25: fixture 기반 `ExecutionResult`는 local runner 요청 시 `fallback_succeeded`를 반환하며 Airflow와 같은 response shape를 유지한다.
- 2026-06-25: 첫 slice를 `feat: add week2 workflow catalog slice` 커밋(`6f8cd2f`)으로 기록했다.
- 2026-06-25: 두 번째 slice에서 `Week2LocalRunner`를 분리해 지원 node type, edge reference, unsupported node failure를 검증한다.
- 2026-06-25: #92 slice에서 `backend/samples/amazon_reviews_demo.jsonl` demo fixture를 추가하고 local runner가 실제 JSONL을 읽어 `row_count`, `bytes`, `duration_ms`, local fallback output path를 계산하게 했다.

## 결정

- Week 2 draft route를 `/api/week2/*`로 추가한다. 기존 `/api/pipelines` baseline은 그대로 둔다.
- 실제 Airflow/MinIO 구현 전까지는 `contracts/*.sample.json`을 로드한 in-memory run/catalog slice로 M1/M6 boundary를 검증한다.
- local runner는 `Source`, `Select/Filter`, `Cast/Normalize`, `Aggregate`, `Load` node만 지원하고, 그 외 node type 또는 깨진 edge reference는 `fallback_failed`로 둔다.
- M3 fixed/extended sample이 준비되기 전에는 `backend/samples/amazon_reviews_demo.jsonl` 4-row demo fixture를 사용하고, aggregate 결과 3 rows를 `ExecutionResult.row_count`로 기록한다.

## 열린 질문

- 실제 Airflow fallback threshold는 M5 adapter 구현 전 확정해야 한다.
- 실제 MinIO endpoint와 local fallback path는 M3/M5 handoff 전에 확정해야 한다.
- Catalog metadata를 나중에 SQLite metadata store에 persist할지 별도 Week 2 store를 둘지 결정이 필요하다.
- local runner는 아직 Parquet을 쓰지 않고 local JSONL fallback output을 쓴다. Parquet/MinIO 전환은 다음 M5/M3 integration slice에서 진행한다.

## 링크 / 증거

- `backend/app/services/week2_workflow.py`
- `backend/app/services/week2_local_runner.py`
- `backend/app/api/week2_workflow.py`
- `backend/tests/test_week2_workflow_catalog.py`
- `backend/tests/test_week2_local_runner.py`
- `backend/samples/amazon_reviews_demo.jsonl`
- `contracts/workflow_definition.sample.json`
- `contracts/execution_result.sample.json`
- `contracts/catalog_metadata.sample.json`
- `contracts/source_config.sample.json`
- `PYTHONPATH=backend ./.venv/bin/pytest backend/tests -q` -> 24 passed
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
row_count: 3
bytes: 195
duration: 2 ms
Produced JSON: ExecutionResult, CatalogMetadata
Consumer module: M1, M6
Blocked issue: actual Airflow, Parquet, MinIO persistence not implemented in this slice
Next first action: convert local JSONL output to Parquet/MinIO path or accept local fallback for Day 2 smoke
```
