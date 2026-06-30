# Product Health External Source Contract 결정 기록

## Runtime source primary, fallback evidence secondary

- Decision: Product Health Source inventory primary connection은 Kafka/PostgreSQL/MongoDB/S3로 표시하고 local/prepared artifact는 fallback evidence로 분리한다.
- Reason: 데모에서 외부 시스템 연결 의미를 설명하려면 `prepared_dataset`이 primary source처럼 보이면 안 된다.
- Deferred: 실제 runtime connection seed, schema discovery, source save alignment는 C-43/C-44로 분리한다.
