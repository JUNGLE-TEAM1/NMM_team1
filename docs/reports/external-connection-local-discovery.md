# External Connection local discovery 보고서

## Short Report / 짧은 보고

- Type: Feature Phase C-14
- Date: 2026-06-30
- Changed: `POST /api/external-connections/inspect`를 추가하고, `local_file`, `local_folder`의 실제 local schema discovery를 UI에 연결했다. 이후 보정으로 `Prepared Dataset` 묶음 옵션을 제거하고 Amazon/MEP/Behavior/Taxi 원천 preset으로 분리했다.
- Verified: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_persistence.py backend/tests/test_external_connection_discovery.py -q`, `npm run build`, `git diff --check`, browser smoke.
- Remaining: Kafka replay, DB/S3 credential discovery, Airflow/Spark 실행, 실제 row-level ingest/ETL은 후속 Phase 범위다.
- Next context: Product Health 원천별 Source Dataset 생성과 Silver/Gold 연결 검증을 이어간다.
- Risk: Kafka replay, DB/S3 credential, 실제 ingest/ETL은 아직 후속 Phase 범위다.
