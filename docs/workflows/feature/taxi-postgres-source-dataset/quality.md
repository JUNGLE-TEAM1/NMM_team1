# Taxi PostgreSQL Source Dataset 등록 품질 기록

- Quality gate status: passed
- TDD status: External Connection persistence/schema preview API tests added and passed.
- Required checks: backend focused tests, frontend build, loader dry-run/load smoke, actual API smoke, `git diff --check`, harness validation.
- Manual verification: TestClient actual PostgreSQL schema preview + Source Dataset API smoke completed.
- Regression focus: password 원문 저장 금지, 빈 schema preview 저장 방지.

## TDD

- Applies: yes
- Reason: External Connection API와 schema preview 계약이 추가된다.

## 검증

| Command | Result | Notes |
| --- | --- | --- |
| `docker run --name asklake-taxi-postgres -e POSTGRES_DB=taxi_postgre -e POSTGRES_USER=asklake -e POSTGRES_PASSWORD=asklake -p 55432:5432 -d postgres:16-alpine` | passed | local PostgreSQL source DB 실행 |
| `.venv/bin/python scripts/load_taxi_parquet_to_postgres.py --input '/Users/liamtsy/Desktop/asklake_taxi_data copy/yellow_tripdata_2026_partial' --limit-files 1 --dry-run` | passed | 1 file, 3,724,889 rows 계획 확인 |
| `ASKLAKE_TAXI_POSTGRES_PASSWORD=asklake .venv/bin/python scripts/load_taxi_parquet_to_postgres.py --input '/Users/liamtsy/Desktop/asklake_taxi_data copy/yellow_tripdata_2026_partial' --limit-files 1 --truncate` | passed | 3,724,889 rows loaded |
| `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_external_connection_persistence.py backend/tests/test_source_dataset_persistence.py -q` | passed, 7 tests | focused API tests |
| `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_external_connection_persistence.py backend/tests/test_source_dataset_persistence.py backend/tests/test_target_dataset_job_draft.py backend/tests/test_target_dataset_run_handoff.py -q` | passed, 13 tests | Dataset module related tests |
| `git diff --check` | passed | whitespace check |
| `scripts/validate-harness.sh` | passed | harness docs validation |
| `PYTHONPATH=backend .venv/bin/python -m py_compile scripts/load_taxi_parquet_to_postgres.py backend/app/services/external_connections.py backend/app/api/source_catalog.py backend/app/adapters/sqlite_metadata_store.py backend/app/domain/schemas.py` | passed | compile check |
| `npm run build` in `frontend` | passed | Vite production build |

## Skipped

- Full 2019~2026 Taxi load: skipped because first Source Dataset registration smoke only needs one-file table.
- Target Dataset run/Catalog/AI Query: intentionally deferred.

## CI/CD Gate / CI-CD 게이트

- CI required: yes for implementation PR
- CI result: local checks passed; remote CI pending after PR
- Deploy/publish required: no
- Deployment confirmation: not required
