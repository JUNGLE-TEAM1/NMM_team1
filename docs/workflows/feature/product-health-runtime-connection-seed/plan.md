# Product Health Runtime Connection Seed 계획

## Phase

- ID: C-43
- Branch/work location: `feature/product-health-runtime-connection-seed`
- Goal: Product Health용 Kafka/PostgreSQL/MongoDB/S3 connection 후보와 runtime readiness를 UI/API에 맞춘다.

## Source Connections

| Connection | Type | Resource example |
| --- | --- | --- |
| `conn_product_health_behavior_kafka` | `kafka` | `product-health.behavior-events` |
| `conn_product_health_catalog_postgres` | `postgres` | `product_catalog` table |
| `conn_product_health_reviews_mongo` | `mongodb` | `product_reviews` collection |
| `conn_product_health_delivery_s3` | `s3` | `s3://asklake-demo/product_health/delivery_logs/` or MinIO endpoint/prefix |

## Scope

- 포함: 연결 화면에서 4개 runtime connection을 만들거나 seed할 수 있게 한다.
- 포함: connection test/readiness 상태와 raw credential 미저장 경계를 표시한다.
- 제외: secret backend 구현, raw credential 저장, full schema discovery, source ingest.

## Acceptance

- 연결 목록에서 Product Health runtime connection 4개가 구분된다.
- 각 connection은 test 가능/불가 이유와 fallback 여부를 표시한다.
- Postgres/Mongo/S3 credential 값은 request/response/log에 저장되지 않는다.

## Verification

```bash
curl -fsS http://127.0.0.1:8000/api/external-connections
curl -fsS http://127.0.0.1:8000/api/external-connections/credential-policy
npm --prefix frontend run build
```
