# Product Health Source Save Alignment 계획

## Phase

- ID: C-44
- Branch/work location: `feature/product-health-source-save-alignment`
- Goal: Product Health Source Dataset 저장 payload를 외부 시스템 connection type과 fallback evidence로 정렬한다.

## Scope

- 포함: Source Dataset 저장 시 `connection_type`을 `kafka`, `postgres`, `mongodb`, `s3`로 저장한다.
- 포함: fallback artifact path는 source primary path가 아니라 evidence/fallback 필드로 분리한다.
- 포함: Source detail에서 runtime source와 demo fallback을 각각 보여준다.
- 제외: 실제 raw snapshot 실행, Silver 생성, schema discovery 고도화.

## Acceptance

- `source_user_events`는 Kafka Source Dataset으로 저장된다.
- `source_product_catalog`는 PostgreSQL Source Dataset으로 저장된다.
- `source_product_reviews`는 MongoDB Source Dataset으로 저장된다.
- `source_delivery_trip_logs`는 S3/MinIO Source Dataset으로 저장된다.
- prepared/local artifact가 primary connection으로 오해되지 않는다.

## Verification

```bash
curl -fsS http://127.0.0.1:8000/api/source-datasets
npm --prefix frontend run build
```
