# Week 2 Workflow Catalog 노트

## 진행 메모

- 2026-06-25: `feature/...` branch 생성은 Git ref lock 문제로 실패했다. 기본 branch prefix 규칙에 따라 `codex/week2-workflow-catalog`를 만들고 workspace는 `docs/workflows/feature/week2-workflow-catalog`에 유지했다.
- 2026-06-25: 프로젝트 전용 `.venv`를 생성했고 `.gitignore`에 `.venv/`를 추가했다.
- 2026-06-25: M5 runtime slice는 기존 baseline `PipelineService`를 섞지 않고 `Week2WorkflowService`로 분리했다.
- 2026-06-25: fixture 기반 `ExecutionResult`는 local runner 요청 시 `fallback_succeeded`를 반환하며 Airflow와 같은 response shape를 유지한다.
- 2026-06-25: 첫 slice를 `feat: add week2 workflow catalog slice` 커밋(`6f8cd2f`)으로 기록했다.
- 2026-06-25: 두 번째 slice에서 `Week2LocalRunner`를 분리해 지원 node type, edge reference, unsupported node failure를 검증한다.
- 2026-06-25: #92 slice에서 `backend/samples/amazon_reviews_demo.jsonl` demo fixture를 추가하고 local runner가 실제 JSONL을 읽어 `row_count`, `bytes`, `duration_ms`, local fallback output path를 계산하게 했다.
- 2026-06-25: #93 slice에서 catalog가 최신 성공 run(`run_reviews_demo_002`)을 가리키는지, 실패 run 이후에도 직전 성공 catalog를 유지하는지 테스트로 고정했다.
- 2026-06-25: #94 slice에서 `Week2AirflowAdapter` boundary를 추가했다. `executor=airflow`는 Airflow adapter를 먼저 시도하고, adapter 미설정 또는 `succeeded` 외 status가 나오면 `Week2LocalRunner`로 fallback한다.
- 2026-06-25: M2 Taxi bootstrap PR #98 검토 후 Week 2 execution metric semantics를 잠갔다. `ExecutionResult.row_count/bytes`는 primary input 기준, `CatalogMetadata.metrics.row_count/bytes`는 output dataset 기준이다.
- 2026-06-25: #95 slice에서 M5 Day 2 smoke evidence를 `docs/reports/m5-day2-smoke-evidence.md`로 남겼다.

## 결정

- Week 2 draft route를 `/api/week2/*`로 추가한다. 기존 `/api/pipelines` baseline은 그대로 둔다.
- 실제 Airflow/MinIO 구현 전까지는 `contracts/*.sample.json`을 로드한 in-memory run/catalog slice로 M1/M6 boundary를 검증한다.
- local runner는 `Source`, `Select/Filter`, `Cast/Normalize`, `Aggregate`, `Load` node만 지원하고, 그 외 node type 또는 깨진 edge reference는 `fallback_failed`로 둔다.
- M3 fixed/extended sample이 준비되기 전에는 `backend/samples/amazon_reviews_demo.jsonl` 4-row demo fixture를 사용한다. `ExecutionResult.row_count=4`, `ExecutionResult.bytes=580`은 input 기준이고, aggregate 결과 3 rows와 195 bytes는 `CatalogMetadata.metrics`와 `Load` task 기준으로 기록한다.
- catalog는 `succeeded` 또는 `fallback_succeeded` run에서만 갱신한다. `fallback_failed` run은 run history에는 남지만 catalog 최신 성공 metadata를 덮어쓰지 않는다.
- Airflow fallback threshold는 `succeeded`만 primary success로 보고, adapter unavailable/error 또는 그 외 status는 local runner fallback으로 처리한다.
- Week 2 output path는 `s3://<bucket>/<domain>/<layer>/[dataset_path/]run_id=<run_id>/`를 따른다. `dataset_path`는 Taxi의 `daily_metrics`처럼 domain-specific Gold output을 담을 때만 사용한다.

## 열린 질문

- 실제 외부 Airflow webserver/scheduler/API 연결 방식은 아직 정하지 않았다.
- 실제 MinIO endpoint와 local fallback path는 M3/M5 handoff 전에 확정해야 한다.
- Catalog metadata를 나중에 SQLite metadata store에 persist할지 별도 Week 2 store를 둘지 결정이 필요하다.
- local runner는 아직 Parquet을 쓰지 않고 local JSONL fallback output을 쓴다. Parquet/MinIO 전환은 다음 M5/M3 integration slice에서 진행한다.
- catalog persistence는 아직 in-memory다. process restart 이후 최신 catalog 조회는 후속 persistence slice에서 다룬다.

## 링크 / 증거

- `backend/app/services/week2_workflow.py`
- `backend/app/services/week2_airflow_adapter.py`
- `backend/app/services/week2_local_runner.py`
- `backend/app/api/week2_workflow.py`
- `backend/tests/test_week2_workflow_catalog.py`
- `backend/tests/test_week2_local_runner.py`
- `backend/samples/amazon_reviews_demo.jsonl`
- `contracts/workflow_definition.sample.json`
- `contracts/execution_result.sample.json`
- `contracts/catalog_metadata.sample.json`
- `contracts/source_config.sample.json`
- M2 PR #98 contract comment: `https://github.com/JUNGLE-TEAM1/NMM_team1/pull/98#issuecomment-4798361794`
- `docs/reports/m5-day2-smoke-evidence.md`
- `PYTHONPATH=backend ./.venv/bin/pytest backend/tests -q` -> 30 passed
- `PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py -q` -> 12 passed
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
ExecutionResult.row_count: 4
ExecutionResult.bytes: 580
CatalogMetadata.metrics.row_count: 3
CatalogMetadata.metrics.bytes: 195
duration: 2 ms
Produced JSON: ExecutionResult, CatalogMetadata
Consumer module: M1, M6
Blocked issue: actual Airflow, Parquet, MinIO persistence not implemented in this slice
Next first action: convert local JSONL output to Parquet/MinIO path or accept local fallback for Day 2 smoke
```

## #93 Catalog Latest Run Evidence

```text
latest successful run: run_reviews_demo_002
catalog s3_uri: s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_002/
failed run behavior: fallback_failed run_id=run_reviews_demo_002 does not overwrite run_reviews_demo_001 catalog in failure-path test
focused verification: PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py -q -> 5 passed
```

## #94 Airflow Fallback Evidence

```text
airflow success behavior: adapter status=succeeded keeps ExecutionResult.status=succeeded and updates CatalogMetadata
airflow unavailable behavior: default adapter falls back to local runner and returns fallback_succeeded
airflow failed behavior: adapter status=failed falls back to local runner; if local runner also fails, catalog is not updated
fallback threshold: Airflow primary success requires status=succeeded
focused verification: PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py -q -> 12 passed
```

## #95 Day 2 Smoke Evidence

```text
report: docs/reports/m5-day2-smoke-evidence.md
run_id: run_reviews_demo_001
executor: local_runner
status: fallback_succeeded
ExecutionResult.row_count: 4
ExecutionResult.bytes: 580
CatalogMetadata.metrics.row_count: 3
CatalogMetadata.metrics.bytes: 195
local output path: data/week2/reviews/gold/run_id=run_reviews_demo_001/dataset_reviews_gold.jsonl
blocked issue: external Airflow, Parquet/MinIO write, persistent Catalog store are not implemented in this smoke
next first action: Day 3 Catalog 연결에서 CatalogMetadata persistence 또는 M3 output handoff를 붙인다
focused verification: PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py -q -> 12 passed
```

## Metric Semantics Lock Evidence

```text
contract source: docs/03-interface-reference.md Week 2 execution metric semantics
ExecutionResult.row_count: primary input rows processed
ExecutionResult.bytes: primary input bytes read
CatalogMetadata.metrics.row_count: output dataset rows
CatalogMetadata.metrics.bytes: output dataset bytes
local demo evidence: input rows=4, input bytes=580, output rows=3, output bytes=195
focused verification: PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py -q -> 12 passed
```
