# Catalog payload 기반 Catalog 등록 보고서

## Phase

- Type: feature
- Branch/work location: `feat-#268`, `docs/workflows/feature/catalog-payload-registration`
- Date: 2026-06-30
- Workspace state: ready-for-review

## Goal

- PR 5A Manual Run result의 `catalog_payload`를 PR 6 Catalog 등록에 그대로 쓰고, `catalog_payload.storage_uri`가 있을 때 gold parquet 경로를 직접 추측하지 않게 한다.

## Changed

- `Week2RunnerResult`에 optional `catalog_payload`를 추가했다.
- `Week2AirflowAdapter`가 `week2_result.catalog_payload`를 보존하고, `catalog_payload.storage_uri`가 있으면 `output_path` 없이도 성공 result로 변환한다.
- `Week2WorkflowService`가 성공 run에서 `catalog_payload`를 우선해 `CatalogMetadata`를 등록한다.
- `catalog_payload.storage_uri` 누락 시 기존 path 추측 fallback을 쓰지 않고 Catalog 등록을 건너뛰며 run log에 이유를 남긴다.
- Week 2 contract fixture와 `docs/03`, `docs/05`, `docs/06`, `docs/07`을 갱신했다.

## Verification

- `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_workflow_catalog.py -q` -> passed, 27 passed
- `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py backend/tests/test_week2_ai_query.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_duckdb_sql_engine.py -q` -> passed, 47 passed
- `python3 -m json.tool ...` for updated contract fixtures -> passed
- `git diff --check` -> passed
- `scripts/validate-harness.sh --strict` -> passed

## Context Budget Evidence

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, Week 2 service/tests
- Escalated context read: `docs/03`, `docs/05`, `docs/06`, `docs/07`, `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- Context omitted intentionally: full report archive, frontend UI internals, remote GitHub PR state

## Regression Guard

- Protected behavior: `catalog_payload.storage_uri`가 있으면 Catalog URI는 해당 값을 그대로 따른다.
- Failure scenario: `storage_uri`가 빠진 `catalog_payload`가 들어왔을 때 M5가 `output_path`로 gold parquet path를 추측하지 않는다.
- Result: focused tests added and passing.

## Acceptance Link

- Related item: Week 2 M5 Manual Run/Catalog handoff
- Status: implemented
- Evidence: `backend/tests/test_week2_workflow_catalog.py` catalog_payload tests

## Remaining

- PR 5A final artifact shape must still be checked when available.
