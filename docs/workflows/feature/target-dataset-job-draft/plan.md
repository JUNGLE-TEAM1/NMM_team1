# Target Dataset job draft 계획

## 브랜치

- Branch: `feature/target-dataset-job-draft`
- Workspace: `docs/workflows/feature/target-dataset-job-draft`
- Created: 2026-06-30

## 목표

Target Dataset Review 결과를 backend metadata로 저장해 C-4 run handoff가 소비할 수 있는 ETL job draft를 만든다.

## 범위

- `POST /api/target-dataset-drafts` create API.
- `GET /api/target-dataset-drafts` list API.
- `GET /api/target-dataset-drafts/{draft_id}` detail API.
- SQLite `target_dataset_drafts` metadata table.
- Frontend Review CTA를 실제 저장 버튼으로 연결.
- Payload에 `base_source_ref`, `target_grain`, `source_refs[]`, `silver_outputs[]`, `processing_recipes[]`, `executor_handoff`, `schedule`, `schema_preview` 포함.

## 범위 제외

- Airflow DAG trigger.
- local_runner/spark_runner 실행.
- 실제 Silver/Gold 파일 materialization.
- CatalogMetadata publish.

## 완료 기준

- [x] Target Dataset draft metadata를 저장/조회할 수 있다.
- [x] Review 저장 버튼이 실제 API를 호출한다.
- [x] 저장된 draft가 `draft_ready` 상태로 조회된다.
- [x] backend focused tests, frontend build, contract JSON, HTTP/browser smoke를 통과한다.
