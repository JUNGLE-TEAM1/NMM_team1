# Runtime connector schema discovery

## 요약

PostgreSQL/MongoDB/S3/Kafka의 lightweight schema discovery를 추가했다. 이제 connection test를 통과한 runtime connector도 지정한 raw scope의 schema/sample evidence를 읽은 뒤 Source Dataset metadata로 저장할 수 있다.

## 변경 사항

- `ExternalConnectionInspectRequest`에 `secret_refs`, `options`를 추가했다.
- `ExternalConnectionDiscoveryService`가 Postgres/Mongo/S3/Kafka를 지원한다.
- Source Dataset wizard가 runtime connector의 raw scope를 table/collection/object/topic scope로 사용한다.
- `Schema discovery 실행` 버튼을 Raw Dataset 설정 단계에 추가했다.
- Vite proxy 기본값을 현재 backend `18000`으로 보정했다.

## 검증

- Backend focused tests: `24 passed`.
- Frontend build: 성공.
- 실제 runtime API smoke:
  - Postgres table schema/sample.
  - Mongo collection schema/sample.
  - S3 JSONL object schema/sample.
  - Kafka topic sample message schema.
- Browser smoke:
  - S3 connection 생성 후 Source Dataset 저장 성공.

## 남은 범위

- full ingest/snapshot은 C-26C.
- Silver materialization은 C-27.
- Kafka continuous replay/consume 운영화는 후속.
