# MongoDB Source Dataset seed 노트

## 진행 메모

- 2026-06-30: 사용자가 PostgreSQL 대신 MongoDB를 실제로 연결하고, 우리가 만든 데이터 일부를 Docker MongoDB에 넣어 달라고 요청했다.
- 현재 checkout branch는 `feature/llm-runtime-settings-ui`이고 unrelated dirty 변경이 있어 branch switch 없이 `--no-checkout --no-issue` workspace로 진행했다.
- MongoDB는 main `docker-compose.yml`을 직접 확장하지 않고 `docker-compose.mongodb.yml` override로 추가했다.
- seed data는 기존 `data/asklakemart_chimera_raw_test/events.jsonl`에서 500 rows를 사용했다.

## 결정

- 이번 Phase는 External Connection + Source Dataset metadata까지 닫고, Target run/Catalog/AI Query는 후속으로 둔다.
- MongoDB connection host는 backend container 기준 service name `mongo`를 사용한다.

## 열린 질문

- MongoDB Source Dataset을 Product Health `behavior` source role로 연결할지는 후속 Target Dataset/Run Phase에서 결정한다.

## 링크 / 증거

- Docker container: `asklake-mongodb`, port `27017`, database `asklake_demo`, collection `customer_events`.
- Seed result: `inserted_count=500`, `collection_count_estimate=500`.
- External Connection id: `734b6a7b-4967-4fcb-9fec-8ad383bae81d`.
- Source Dataset id: `5026d802-61eb-49db-ba4b-aa9c8d121d90`.
- Follow-up UI fix: Configure 단계의 `Test Connection` button render 조건이 `postgres` 전용으로 남아 MongoDB에서 버튼이 숨겨졌다. `usesSchemaPreviewConnection` 공통 조건으로 수정했다.
