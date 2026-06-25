# M5 Day 3 Catalog Persistence Handoff 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-25
- Changed: `Week2CatalogStore`를 추가해 Week 2 run history와 latest `CatalogMetadata`를 `output_root/_metadata` 아래 JSON 파일로 저장한다. `Week2WorkflowService`는 시작 시 저장된 run/catalog를 로드하고, 다음 `run_id` sequence를 이어간다.
- Verified: `PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py -q` -> 14 passed; `PYTHONPATH=backend ./.venv/bin/pytest backend/tests -q` -> 32 passed; `jq -e . contracts/catalog_metadata.sample.json contracts/execution_result.sample.json contracts/workflow_definition.sample.json contracts/source_config.sample.json contracts/ai_query_result.sample.json contracts/schema_definition.sample.json` -> passed; `scripts/validate-harness.sh --strict` -> passed.
- Remaining: actual SQLite/Postgres Catalog DB persistence, external Airflow trigger, Parquet/MinIO output은 아직 후속 slice다.
- Next context: 다음 M5 slice는 external Airflow trigger, Parquet/MinIO output, actual Catalog DB persistence 중 하나를 선택한다. 이번 slice의 handoff root는 `<output_root>/_metadata`다.
- Risk: JSON handoff store는 local MVP persistence다. 동시 실행, DB migration, multi-worker catalog serving 요구가 생기면 SQLite/Postgres store로 전환해야 한다.

## Issue

- GitHub issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/101

## Verification Notes / 검증 메모

- Service restart 후 `run_reviews_demo_001` run과 `dataset_reviews_gold` catalog를 다시 조회한다.
- Restart 이후 다음 실행은 `run_reviews_demo_002`로 이어진다.
- `fallback_failed` run은 run history에는 저장되지만 latest successful catalog를 덮어쓰지 않는다.

## Acceptance / Regression / Manual Verification

- Acceptance: `contracts/*.sample.json` fixture와 `docs/03` Week 2 contract shape를 유지했다.
- Regression: 실패한 pipeline run이 성공한 catalog dataset처럼 표시되지 않도록 `test_week2_failed_run_survives_restart_without_overwriting_catalog`로 확인했다.
- Manual verification: `docs/07`의 Week 2 fixture JSON 유효성 확인 항목은 `jq -e`로 확인했다. API shape는 backend focused test로 확인했다.

## Secret / Migration / Env Check

- Secret: 새 secret 없음.
- Migration/data change: DB migration 없음. local JSON metadata files만 생성된다.
- Env change: 새 환경 변수 없음.
