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
- 2026-06-25: Day 3 Catalog persistence handoff slice에서 `Week2CatalogStore`를 추가했다. run history와 latest catalog metadata를 `output_root/_metadata` 아래 JSON으로 저장해 service restart 후에도 조회하고 다음 `run_id` sequence를 이어간다.
- 2026-06-25: Day 3 Catalog persistence handoff slice를 GitHub issue #101로 등록했다.
- 2026-06-25: PR 전 사람이 직접 눈으로 확인할 수 있도록 frontend에 `Week2M5Demo` 패널을 추가했다. 이 패널은 `POST /api/week2/workflows/pipeline_reviews_json_e2e/runs`와 `GET /api/week2/catalog/dataset_reviews_gold`를 호출해 `ExecutionResult`, `CatalogMetadata`, storage path를 보여준다.
- 2026-06-25: M5 local UI demo panel slice를 GitHub issue #112로 등록했다.

## 결정

- Week 2 draft route를 `/api/week2/*`로 추가한다. 기존 `/api/pipelines` baseline은 그대로 둔다.
- 실제 Airflow/MinIO 구현 전까지는 `contracts/*.sample.json`을 로드한 local run/catalog slice로 M1/M6 boundary를 검증한다. run/catalog handoff metadata는 `output_root/_metadata` 아래 JSON으로 유지한다.
- local runner는 `Source`, `Select/Filter`, `Cast/Normalize`, `Aggregate`, `Load` node만 지원하고, 그 외 node type 또는 깨진 edge reference는 `fallback_failed`로 둔다.
- M3 fixed/extended sample이 준비되기 전에는 `backend/samples/amazon_reviews_demo.jsonl` 4-row demo fixture를 사용한다. `ExecutionResult.row_count=4`, `ExecutionResult.bytes=580`은 input 기준이고, aggregate 결과 3 rows와 195 bytes는 `CatalogMetadata.metrics`와 `Load` task 기준으로 기록한다.
- catalog는 `succeeded` 또는 `fallback_succeeded` run에서만 갱신한다. `fallback_failed` run은 run history에는 남지만 catalog 최신 성공 metadata를 덮어쓰지 않는다.
- Airflow fallback threshold는 `succeeded`만 primary success로 보고, adapter unavailable/error 또는 그 외 status는 local runner fallback으로 처리한다.
- Week 2 output path는 `s3://<bucket>/<domain>/<layer>/[dataset_path/]run_id=<run_id>/`를 따른다. `dataset_path`는 Taxi의 `daily_metrics`처럼 domain-specific Gold output을 담을 때만 사용한다.
- Catalog persistence handoff는 actual DB migration 없이 `Week2CatalogStore` JSON files로 잠근다. SQLite/Postgres catalog store 전환은 후속 integration slice에서 별도 결정한다.

## 열린 질문

- 실제 외부 Airflow webserver/scheduler/API 연결 방식은 아직 정하지 않았다.
- 실제 MinIO endpoint와 local fallback path는 M3/M5 handoff 전에 확정해야 한다.
- Catalog metadata를 나중에 SQLite metadata store에 persist할지 별도 Week 2 store를 둘지는 후속 integration slice에서 결정한다.
- local runner는 아직 Parquet을 쓰지 않고 local JSONL fallback output을 쓴다. Parquet/MinIO 전환은 다음 M5/M3 integration slice에서 진행한다.
- 실제 DB catalog persistence는 아직 없다. 이번 slice는 local JSON handoff persistence까지만 다룬다.

## 링크 / 증거

- `backend/app/services/week2_workflow.py`
- `backend/app/services/week2_catalog_store.py`
- `backend/app/services/week2_airflow_adapter.py`
- `backend/app/services/week2_local_runner.py`
- `backend/app/api/week2_workflow.py`
- `frontend/src/features/week2/Week2M5Demo.jsx`
- `frontend/src/api/week2Api.js`
- `backend/tests/test_week2_workflow_catalog.py`
- `backend/tests/test_week2_local_runner.py`
- `backend/samples/amazon_reviews_demo.jsonl`
- `contracts/workflow_definition.sample.json`
- `contracts/execution_result.sample.json`
- `contracts/catalog_metadata.sample.json`
- `contracts/source_config.sample.json`
- M2 PR #98 contract comment: `https://github.com/JUNGLE-TEAM1/NMM_team1/pull/98#issuecomment-4798361794`
- M5 Day 3 issue: `https://github.com/JUNGLE-TEAM1/NMM_team1/issues/101`
- M5 UI demo issue: `https://github.com/JUNGLE-TEAM1/NMM_team1/issues/112`
- `docs/reports/m5-day2-smoke-evidence.md`
- `docs/reports/m5-day3-catalog-persistence-handoff.md`
- `docs/reports/m5-ui-demo.md`
- `PYTHONPATH=backend ./.venv/bin/pytest backend/tests -q` -> 32 passed
- `PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py -q` -> 14 passed
- `npm run build` in `frontend/` -> passed
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

## Day 3 Catalog Persistence Handoff Evidence

```text
store: Week2CatalogStore
metadata root: <output_root>/_metadata
run files: <output_root>/_metadata/runs/<run_id>.json
catalog files: <output_root>/_metadata/catalog/<dataset_id>.json
restart behavior: run_reviews_demo_001 조회 가능, 다음 실행은 run_reviews_demo_002로 증가
failure behavior: fallback_failed run은 run history에 저장되지만 latest successful catalog를 덮어쓰지 않음
focused verification: PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py -q -> 14 passed
full backend verification: PYTHONPATH=backend ./.venv/bin/pytest backend/tests -q -> 32 passed
```
