# Product Health External Source Contract 계획

## Phase

- ID: C-42
- Branch/work location: `feature/product-health-external-source-contract`
- Goal: Product Health 원천 후보를 Kafka/PostgreSQL/MongoDB/S3 기준으로 재정의한다.

## Target Contract

| Source role | Runtime connection | Demo fallback |
| --- | --- | --- |
| `behavior_events` | Kafka topic | existing behavior parquet/csv evidence |
| `product_catalog` | PostgreSQL table | existing product catalog parquet/json evidence |
| `reviews` / VOC | MongoDB collection | existing review parquet/json evidence |
| `delivery_trip_logs` | S3/MinIO object or prefix | existing delivery/taxi parquet evidence |

## Scope

- 포함: Product Health source inventory contract, label, resource, status vocabulary 수정.
- 포함: local/prepared artifact를 primary source가 아니라 `demo_fallback` evidence로 표현하는 기준 정의.
- 제외: 실제 Kafka consume, PostgreSQL query execution, MongoDB document scan, S3 object scan, Silver/Gold materialization.

## Acceptance

- Source inventory에서 4개 원천이 외부 시스템 기준으로 보인다.
- 각 후보는 runtime source와 fallback evidence를 분리해서 설명한다.
- `prepared_dataset`이 Product Health primary connection type처럼 보이지 않는다.

## Verification

```bash
curl -fsS http://127.0.0.1:8000/api/product-health/source-inventory
npm --prefix frontend run build
```
