# External connection runtime checks

## 요약

External Connection에 lightweight runtime connection test를 추가했다. 이제 AskLake API/UI에서 PostgreSQL, MongoDB, MinIO/S3, Kafka가 실제 local runtime에 닿는지 확인할 수 있다. 단, 이 성공은 schema discovery, ingest, Source Dataset 생성, Kafka replay/consume 완료가 아니다.

## 변경 사항

- `POST /api/external-connections/test` 추가.
- `ExternalConnectionTestRequest`, `ExternalConnectionTestResult` contract 추가.
- `ExternalConnectionRuntimeCheckService` 추가.
- backend 의존성 추가: `psycopg[binary]`, `pymongo`, `boto3`, `kafka-python`.
- `/connections` 화면에 `Runtime connection checks` panel 추가.
- `docs/03`, `docs/06`, `docs/07`에 C-25 contract와 검수 기준 반영.

## 검증

- backend focused tests: `12 passed`.
- frontend build: 성공.
- 실제 local runtime API smoke:
  - PostgreSQL: passed.
  - MongoDB: passed.
  - MinIO/S3: passed.
  - Kafka: passed.
- browser smoke:
  - `/connections` panel 표시.
  - PostgreSQL runtime test click 성공.
  - console error 없음.

## 남은 범위

- connector별 schema discovery는 C-26 이후.
- credential secret backend/Vault는 아직 없음.
- connection test result persistence/audit table은 아직 없음.
- Kafka replay/consume trigger는 아직 없음.
