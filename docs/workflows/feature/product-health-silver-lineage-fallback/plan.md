# Product Health Silver Lineage Fallback 계획

## Phase

- ID: C-45
- Branch/work location: `feature/product-health-silver-lineage-fallback`
- Goal: Silver Dataset을 외부 Source lineage와 prepared fallback parquet에 동시에 연결한다.

## Scope

- 포함: Silver Dataset 4개가 외부 Source Dataset을 lineage로 가리키게 한다.
- 포함: row materialization은 demo prepared parquet fallback임을 표시한다.
- 포함: Silver detail/review에서 runtime source, fallback path, row/schema evidence를 분리한다.
- 제외: Kafka continuous consume, PostgreSQL/Mongo/S3 full ingest, Spark distributed materialization.

## Acceptance

- `silver_user_events` lineage가 Kafka Source를 가리킨다.
- `silver_product_catalog` lineage가 PostgreSQL Source를 가리킨다.
- `silver_product_reviews` lineage가 MongoDB Source를 가리킨다.
- `silver_delivery_trip_logs` lineage가 S3/MinIO Source를 가리킨다.
- prepared parquet row/schema evidence가 fallback으로 표시된다.

## Verification

```bash
curl -fsS http://127.0.0.1:8000/api/silver-datasets
npm --prefix frontend run build
```
