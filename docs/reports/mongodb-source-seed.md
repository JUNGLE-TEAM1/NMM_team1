# MongoDB Source Dataset seed 보고서

## Short Report / 짧은 보고

- Type: Feature Phase
- Date: 2026-06-30
- Changed: MongoDB External Connection support, collection schema preview, MongoDB Docker compose override, JSONL seed script, Source Dataset UI/API support, related Source of Truth docs.
- Verified: local Docker MongoDB `asklake_demo.customer_events`에 500 demo event rows 적재, MongoDB connection test/schema preview 200, External Connection 201, Source Dataset 201, post-merge focused backend tests 17 passed, frontend build passed, Docker/API smoke passed.
- Remaining: Target Dataset run, CatalogMetadata publish, AI Query 연결은 후속 Phase로 남긴다.
- Next context: saved Source Dataset id `5026d802-61eb-49db-ba4b-aa9c8d121d90`, raw scope `asklake_demo.customer_events`, connection id `734b6a7b-4967-4fcb-9fec-8ad383bae81d`.
- Risk: local demo credential `asklake`는 Docker smoke 전용이며 실제 credential로 쓰면 안 된다. 현재 checkout branch에는 unrelated `feature/llm-runtime-settings-ui` dirty 변경이 함께 있고, `origin/main` `218741b8`은 fast-forward merge 후 로컬 변경으로 재적용되어 있다.

## Evidence

- Docker service: `asklake-mongodb`, image `mongo:7`, port `27017`.
- Seed input: `data/asklakemart_chimera_raw_test/events.jsonl`.
- Seed result: `inserted_count=500`, `collection_count_estimate=500`.
- Schema preview: `channel`, `device_type`, `event_id`, `event_time`, `event_type`, `price`, `product_id`, `session_id`, `user_id`, `order_id`.

## Verification Commands

```bash
docker compose -f docker-compose.yml -f docker-compose.mongodb.yml up -d --build mongo backend
docker exec nmm_team1-backend-1 python scripts/load_jsonl_to_mongodb.py --input data/asklakemart_chimera_raw_test/events.jsonl --host mongo --database asklake_demo --collection customer_events --limit 500 --truncate
curl -fsS -X POST http://127.0.0.1:8000/api/external-connections/test -H 'Content-Type: application/json' -d '{"name":"AskLake MongoDB Events","connection_type":"mongodb","host":"mongo","port":27017,"database":"asklake_demo","username":"asklake","password_secret_ref":"ASKLAKE_MONGODB_PASSWORD","default_schema":"asklake_demo","default_table":"customer_events"}'
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_external_connection_persistence.py backend/tests/test_source_dataset_persistence.py -q
npm run build
```

## Follow-Up

- MongoDB Source Dataset을 Product Health `behavior` input으로 연결할지 결정한다.
- Target run/Catalog/AI Query 연결은 별도 Phase에서 Source of Truth와 acceptance를 먼저 확인한다.
