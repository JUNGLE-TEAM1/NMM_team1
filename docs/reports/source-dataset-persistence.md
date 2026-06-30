# Source Dataset persistence 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Source Dataset metadata 저장/조회 API와 UI 저장 버튼을 연결했다. 저장 대상은 ingest 결과가 아니라 `connection_id`, `connection_name`, `connection_type`, `name`, `raw_scope`, `resource_label`, `schema_preview` metadata다.
- Verified: backend focused test 3 passed, frontend build 통과, contract JSON validation 통과, TestClient API smoke와 local HTTP smoke 통과.
- Remaining: Target Dataset wizard의 source 선택 후보를 API 기반 Source Dataset 목록으로 바꾸는 작업이 남았다.
- Next context: `/dataset` -> Source Dataset -> Review에서 저장하면 `/api/source-datasets`에 `metadata_ready` record가 생긴다.
- Risk: 실제 파일 업로드/ingest/Kafka consume/DB credential test는 아직 없다.
