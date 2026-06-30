# Taxi PostgreSQL Source Dataset 등록 보고서

## Short Report / 짧은 보고

- Type: Feature Phase
- Date: 2026-06-30
- Changed: Taxi Parquet -> PostgreSQL loader, External Connection metadata API, PostgreSQL schema preview API, Source Dataset wizard 실제 connection/schema preview 연결을 추가했다.
- Verified: local PostgreSQL `taxi_postgre` 실행, 2026-01 Taxi 3,724,889 rows smoke load, focused backend tests 12 passed, frontend build passed, actual schema preview + Source Dataset API smoke passed.
- Remaining: `source_file` / `service_year_month` 추가 여부 human confirmation, full Taxi load, Target Run/Catalog/AI Query 연결.
- Next context: 이번 slice는 Source Dataset metadata 등록까지만 닫는다. Target 실행은 후속 Phase에서 `source_dataset_id -> Taxi runner` handoff로 다룬다.
- Risk: local demo password `asklake`는 `.env.example`의 예시값이며 실제 credential로 쓰면 안 된다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08` Dataset Module Connection Queue, `docs/03` Source Dataset API, 관련 backend/frontend files
- Escalated context read: `docs/05`, `docs/06`, `docs/07`, Taxi runner/data inventory
- Context omitted intentionally: Target Run/Catalog/AI Query deep implementation docs because user deferred item 8

## Manual Verification / 수동 검증

- Environment: local Docker PostgreSQL `asklake-taxi-postgres`, DB `taxi_postgre`, port `55432`
- Evidence: `yellow_tripdata_2026-01.parquet` 3,724,889 rows loaded into `public.yellow_taxi_trips`
- API smoke: External Connection 201, schema preview 200 with 19 columns, Source Dataset 201

## Secret / Migration / Env Check

- Secret check: password 원문은 metadata table/API model에 저장하지 않고 `password_secret_ref`만 저장한다.
- Migration/data change: local SQLite metadata에 `external_connections` table additive migration, local PostgreSQL smoke table 생성.
- Env change: `.env.example`에 local Taxi PostgreSQL demo env 추가.
