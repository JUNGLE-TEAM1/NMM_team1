# Runtime connector schema discovery 품질 기록

## 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_discovery.py backend/tests/test_external_connection_runtime_checks.py backend/tests/test_source_dataset_persistence.py -q
npm --prefix frontend run build
```

- 결과: backend focused tests `24 passed`.
- 결과: frontend build 성공.

## 실제 API Smoke

- PostgreSQL `public.connection_smoke`: schema/sample discovery 통과.
- MongoDB `asklake.connection_smoke`: schema/sample discovery 통과.
- S3 `product_health/source/s3_events.jsonl`: schema/sample discovery 통과.
- Kafka `asklake-connection-smoke`: schema/sample discovery 통과.

## Browser Smoke

- S3 connection 생성, runtime test, 저장.
- S3 Source Dataset 생성 화면에서 `Schema discovery 실행`.
- schema preview `event_id`, `product_id`, `event_type`, `quantity` 확인.
- `source_s3_discovery_<timestamp>` 저장 확인.

## Regression Guard

- connection test와 schema discovery는 분리 유지.
- schema discovery와 ingest/snapshot은 분리 유지.
- raw credential value 저장/노출 없음.
