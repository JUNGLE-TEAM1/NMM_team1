# Taxi PostgreSQL Source Dataset 등록 보고서

## Short Report / 짧은 보고

- Type: Feature Phase
- Date: 2026-06-30
- Changed: Taxi Parquet -> PostgreSQL loader, External Connection metadata API, PostgreSQL schema preview API, Source Dataset wizard 실제 connection/schema preview 연결을 추가했다.
- Verified: local PostgreSQL `taxi_postgre` 실행, 2026-01 Taxi 3,724,889 rows smoke load, focused backend tests 13 passed, frontend build passed, actual schema preview + Source Dataset API smoke passed.
- Remaining: `source_file` / `service_year_month` 추가 여부 human confirmation, full Taxi load, Target Run/Catalog/AI Query 연결.
- Next context: 이번 slice는 Source Dataset metadata 등록까지만 닫는다. Target 실행은 후속 Phase에서 `source_dataset_id -> Taxi runner` handoff로 다룬다.
- Risk: local demo password `asklake`는 `.env.example`의 예시값이며 실제 credential로 쓰면 안 된다.

## Evidence

- Branch/work location: `feat-#296`, `docs/workflows/feature/taxi-postgres-source-dataset`
- Manual smoke input: `/Users/liamtsy/Desktop/asklake_taxi_data copy/yellow_tripdata_2026_partial/yellow_tripdata_2026-01.parquet`
- Loaded rows: `3,724,889`
- Source table: `public.yellow_taxi_trips`
- Source schema preview: 19 lowercase/canonical columns, `airport_fee` 통합, `cbd_congestion_fee` 제외

## Verification Commands

```bash
.venv/bin/python scripts/load_taxi_parquet_to_postgres.py --input '/Users/liamtsy/Desktop/asklake_taxi_data copy/yellow_tripdata_2026_partial' --limit-files 1 --dry-run
ASKLAKE_TAXI_POSTGRES_PASSWORD=asklake .venv/bin/python scripts/load_taxi_parquet_to_postgres.py --input '/Users/liamtsy/Desktop/asklake_taxi_data copy/yellow_tripdata_2026_partial' --limit-files 1 --truncate
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_external_connection_persistence.py backend/tests/test_source_dataset_persistence.py backend/tests/test_target_dataset_job_draft.py backend/tests/test_target_dataset_run_handoff.py -q
PYTHONPATH=backend .venv/bin/python -m py_compile scripts/load_taxi_parquet_to_postgres.py backend/app/services/external_connections.py backend/app/api/source_catalog.py backend/app/adapters/sqlite_metadata_store.py backend/app/domain/schemas.py
npm run build
```

## Follow-Up

- `source_file`, `service_year_month` 컬럼은 사용자 승인 전까지 보류한다.
- 저장 전 `Test Connection`은 이번 slice에 포함했지만, production credential vault와 연결 상태 persistence는 후속으로 둔다.
- Target Dataset run/Catalog/AI Query 연결은 이번 slice에서 제외했다.
