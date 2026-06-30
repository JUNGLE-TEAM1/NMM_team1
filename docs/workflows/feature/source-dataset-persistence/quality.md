# Source dataset persistence 품질 게이트

- TDD status: API contract focused test 추가.
- Required checks: backend focused tests, frontend build, source dataset API smoke, contract JSON validation.
- Manual verification: Source Dataset review에서 저장 버튼이 실제 `/api/source-datasets`를 호출할 수 있게 연결했다. 브라우저 end-to-end 클릭은 Playwright dependency가 없어 build/API smoke로 대체했다.
- Regression focus: 이미 등록된 Source Dataset을 다시 source로 등록하는 오해가 없어야 한다.

## 검증 기록

| 항목 | 명령/방법 | 결과 | 증거 |
| --- | --- | --- | --- |
| backend focused test | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_source_dataset_persistence.py` | passed | 3 passed |
| frontend build | `cd frontend && npm run build` | passed | Vite build 완료 |
| contract JSON | `jq -e . contracts/source_dataset.sample.json` | passed | JSON valid |
| API smoke | `POST /api/source-datasets`, `GET /api/source-datasets` via `TestClient` | passed | `201`, `metadata_ready`, list contains created record |
| HTTP smoke | local backend `http://127.0.0.1:8000/api/source-datasets` | passed | `201`, `200`, `metadata_ready`, list contains created record |

## 생략/제한

- 실제 file ingest, Kafka consume, DB credential test는 이번 Phase 범위가 아니다.
- Target Dataset wizard가 API 기반 Source Dataset 목록을 사용하는 작업은 후속으로 남았다.
