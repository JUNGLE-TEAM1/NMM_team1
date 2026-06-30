# Runtime connector schema discovery

## Short Report / 짧은 보고

- Type: Phase C-26B
- Date: 2026-06-30
- Changed: DB/S3/Kafka runtime connector에서 lightweight schema/sample discovery를 추가하고 Source Dataset 생성 흐름에 연결.
- Verified: backend focused tests `24 passed`, frontend build, 실제 runtime API smoke, S3 browser smoke.
- Remaining: full ingest/snapshot, Silver/Gold materialization, Kafka continuous consume.
- Next context: C-26C에서 Source Dataset raw snapshot/materialization을 별도 실행 단계로 추가한다.
- Risk: discovery는 sample/schema 확인이지 전체 데이터 ingest가 아니다.

## Changed Files / 변경 파일

- `backend/app/domain/schemas.py`
- `backend/app/services/external_connection_discovery.py`
- `backend/tests/test_external_connection_discovery.py`
- `frontend/src/app/App.jsx`
- `frontend/vite.config.js`
- `docs/08-development-workflow.md`
- `docs/workflows/feature/runtime-connector-schema-discovery/`
- `docs/workflows/feature/source-dataset-ingest-snapshot/plan.md`

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_discovery.py backend/tests/test_external_connection_runtime_checks.py backend/tests/test_source_dataset_persistence.py -q
npm --prefix frontend run build
```

## Manual Verification / 수동 검증

- API smoke:
  - Postgres `public.connection_smoke`
  - Mongo `asklake.connection_smoke`
  - S3 `product_health/source/s3_events.jsonl`
  - Kafka `asklake-connection-smoke`
- Browser smoke:
  - S3 connection test/save.
  - S3 Source Dataset schema discovery.
  - S3 Source Dataset 저장.

## Final Judgment / 최종 판단

- Done: DB/S3/Kafka가 Source Dataset metadata 생성 전 schema discovery를 수행할 수 있다.
- Remaining risk: 실제 데이터 복사/ingest는 아직 아니다.
