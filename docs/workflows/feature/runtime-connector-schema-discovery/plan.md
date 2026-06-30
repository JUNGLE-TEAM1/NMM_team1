# Runtime connector schema discovery 계획

## 목표

PostgreSQL/MongoDB/S3/Kafka connection test 이후 Source Dataset 생성 전에 지정한 scope의 lightweight schema discovery를 실행한다.

## 상태

- 2026-06-30: 구현 완료. DB/S3/Kafka가 connection test only에서 멈추지 않고 sample/schema evidence로 Source Dataset metadata를 만들 수 있게 됐다.

## 범위

- PostgreSQL: `options.scope`의 `schema.table` column metadata와 sample rows 조회.
- MongoDB: `options.scope`의 `database.collection` sample document schema 조회.
- S3/MinIO: `options.scope`의 CSV/JSON/JSONL/Parquet object sample/schema 조회.
- Kafka: `options.scope` topic에서 bounded sample message schema 조회.
- Source Dataset wizard에서 raw scope를 discovery scope로 사용하고 `Schema discovery 실행` 후 저장 가능하게 한다.

## 제외 범위

- full table scan.
- S3 prefix 전체 ingest.
- Kafka continuous consume/replay.
- raw snapshot/materialization.
- Silver/Gold 변환.

## Acceptance Criteria

- Postgres/Mongo/S3/Kafka inspect API가 schema_preview와 sample_rows를 반환한다.
- raw credential 값은 request/options/response/report에 남기지 않는다.
- Source Dataset wizard에서 runtime connector도 discovery 성공 후 저장 가능하다.
- discovery 성공을 ingest 완료로 표현하지 않는다.

## Manual Verification

- `/connections`에서 S3 connection test 후 저장.
- `/datasets/source`에서 해당 S3 connection 선택.
- raw scope `product_health/source/s3_events.jsonl`로 `Schema discovery 실행`.
- schema preview 확인 후 Source Dataset 저장.

## 다음 Phase

- C-26C `feature/source-dataset-ingest-snapshot`: Source Dataset metadata 생성 후 실제 raw snapshot/materialization을 실행한다.
