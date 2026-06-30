# Source dataset persistence 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: `SourceDatasetCreate/Record` 계약, SQLite `source_datasets` table, `/api/source-datasets` create/list/read API, frontend `createSourceDataset` client, Source Dataset Review 저장 버튼, `contracts/source_dataset.sample.json`을 추가했다.
- Verified: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_source_dataset_persistence.py`, `cd frontend && npm run build`, `jq -e . contracts/source_dataset.sample.json`, `POST/GET /api/source-datasets` TestClient smoke와 local HTTP smoke 통과.
- Remaining: Target Dataset wizard의 source 선택 후보를 API 기반 Source Dataset 목록으로 교체해야 한다. 실제 file ingest, Kafka consume, DB credential test는 후속 Phase다.
- Next context: External Connection `소스 검사` 결과를 Source Dataset 저장 payload로 넘기는 UI는 연결됐다. 다음은 저장된 source dataset을 Target Dataset 생성에서 소비하는 작업이다.
- Risk: metadata 저장만 완료됐으므로 실제 데이터 적재 완료로 말하면 안 된다.
