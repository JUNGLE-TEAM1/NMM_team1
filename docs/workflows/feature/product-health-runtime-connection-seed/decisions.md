# Product Health Runtime Connection Seed 결정 기록

## Metadata seed before runtime ingest

- Decision: Product Health connection seed는 External Connection metadata와 readiness boundary만 만든다.
- Reason: Kafka/PostgreSQL/MongoDB/S3 runtime을 Product Health 데모에 설명 가능하게 연결하되, secret backend와 full ingest는 별도 Phase로 분리해야 한다.
- Deferred: secret backend, actual schema discovery, source ingest, Kafka replay/consume.
