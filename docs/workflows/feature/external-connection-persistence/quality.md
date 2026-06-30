# External connection persistence 품질 게이트

- TDD status: API contract focused test 추가.
- Required checks: backend focused tests, frontend build, local HTTP smoke, contract JSON validation, harness validation.
- Security check: secret value 저장/노출 금지.
- Manual verification: External Connection 생성, 목록 조회, Source Dataset wizard 후보 반영.
- Current check: External Connection metadata create/list/read API와 UI 저장 버튼 구현.
- Regression focus: External Connection을 기존 `SourceConnection` / `SourceConfig.connection_ref`와 무관한 새 schema로 invent하지 않는다.

## 검증 기록

| 항목 | 명령/방법 | 결과 | 증거 |
| --- | --- | --- | --- |
| backend focused test | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_persistence.py backend/tests/test_source_dataset_persistence.py` | passed | 6 passed |
| frontend build | `cd frontend && npm run build` | passed | Vite build 완료 |
| contract JSON | `jq -e . contracts/external_connection.sample.json contracts/source_dataset.sample.json` | passed | JSON valid |
| HTTP smoke | local backend `POST /api/external-connections`, `GET /api/external-connections` | passed | `201`, `200`, `metadata_ready`, list contains created record |
| harness validation | `scripts/validate-harness.sh` | failed | 기존 미완성 workspace들의 `notes.md`, `shared-docs.md`, `sources.md`, `confirmations.md` 누락으로 55 issues. 이번 Phase 파일 누락은 아님 |
