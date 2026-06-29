# Source dataset persistence 계획

## 브랜치

- Branch: `feature/source-dataset-persistence`
- Workspace: `docs/workflows/feature/source-dataset-persistence`
- Created: 2026-06-29

## 목표

- 등록된 External Connection에서 raw/source dataset metadata를 생성한다.
- `Source Dataset` wizard의 Review 결과를 backend metadata로 저장하고 목록에서 다시 조회한다.

## 범위

- Source Dataset create/list/read API.
- 저장 필드: `source_dataset_id`, `connection_id`, `name`, `raw_scope`, `schema_preview`, `layer=source`, `created_at`, `updated_at`.
- CSV/API/S3/PostgreSQL/Kafka별 raw scope 표현을 External Connection type에 맞춘다.
- M3 schema contract가 붙을 수 있게 schema preview shape를 명확히 둔다.

## 범위 제외

- 실제 ingest 실행.
- 파일 업로드/streaming consume.
- Target Dataset 생성.
- ETL job 생성/실행.
- CatalogMetadata final registration.

## 구현 프롬프트

```text
@AGENTS.md @docs/08-development-workflow.md @docs/03-interface-reference.md @docs/12-quality-gates.md

`feature/source-dataset-persistence` Phase만 구현한다.
등록된 External Connection을 선택해 Source Dataset metadata를 저장/조회하는 API와 UI 연결을 추가한다.
Source Dataset은 raw/source layer 정의이며 ingest나 ETL 실행을 하지 않는다.
schema preview는 M3가 확장 가능한 structured shape로 저장한다.
```

## 완료 기준

- [ ] Source Dataset을 External Connection 기반으로 저장할 수 있다.
- [ ] Source Dataset 목록을 조회할 수 있다.
- [ ] Target Dataset wizard의 source 선택 후보가 API 기반 Source Dataset 목록을 사용한다.
- [ ] ingest/run 실행을 암시하지 않는다.
- [ ] report와 quality evidence를 남긴다.
