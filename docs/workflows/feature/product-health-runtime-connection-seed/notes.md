# Product Health Runtime Connection Seed 노트

- Kafka는 credential 없이 local broker readiness를 확인할 수 있다.
- PostgreSQL/MongoDB/S3는 secret_ref 또는 local dev reference만 저장한다.
- 이 Phase는 Source Dataset 저장 전 connection 후보와 readiness만 닫는다.
