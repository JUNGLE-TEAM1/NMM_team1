# Product Health runtime seed loaders notes

- 2026-07-01: 사용자가 11GB 합성 데이터셋을 Kafka/PostgreSQL/MongoDB/MinIO에 역할별로 적재해야 한다고 확인했다.
- loader 기본값은 현재 repo에 있는 prepared parquet fallback을 가리킨다.
- 실제 11GB 데이터셋은 manifest의 `source_path`를 split 파일 위치로 바꿔 실행한다.
- Kafka/PostgreSQL/MongoDB loader는 CSV/JSONL/Parquet를 streaming 변환한다.
- MinIO loader는 기존 S3-compatible storage adapter를 사용하고 secret value 대신 env var name만 받는다.
