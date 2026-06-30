# Taxi PostgreSQL Source Dataset 등록 source 기록

## Primary context

- Source queue: `docs/08-development-workflow.md` Dataset Module Connection Queue
- decisions.md handoff: 인증/연결 테스트와 Target Run은 보류하고 Source Dataset metadata 등록까지만 닫는다.
- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md` Dataset Module Connection Queue
- `docs/03-interface-reference.md` Source Dataset Metadata API
- `docs/05-acceptance-scenarios-and-checklist.md` Trusted Dataset
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`

## Code context

- `backend/app/api/source_catalog.py`
- `backend/app/adapters/sqlite_metadata_store.py`
- `backend/app/domain/schemas.py`
- `frontend/src/app/App.jsx`
- `frontend/src/api/sourceDatasetApi.js`

## Data context

- `/Users/liamtsy/Desktop/asklake_taxi_data copy/yellow_tripdata_2026_partial/yellow_tripdata_2026-01.parquet`
- Smoke row count: `3,724,889`
