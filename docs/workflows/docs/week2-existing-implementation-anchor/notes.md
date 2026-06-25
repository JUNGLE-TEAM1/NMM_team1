# Week2 existing implementation anchor 노트

## 진행 메모

- Phase 3 PR #120이 merge된 `origin/main` `400bc00` 기준으로 workspace를 만들었다.
- 실제 파일 경로 확인을 위해 backend/frontend/contracts/manual verification 파일을 `rg`로 확인했다.
- 기존 구현 anchor는 후속 code PR의 삭제/전면 대체 방지 기준이다.

## 결정

- M5 `Week2WorkflowService`, `Week2LocalRunner`, `Week2CatalogStore`를 통합 anchor로 유지한다.
- M6 `Week2AIQueryService`, `SqlEngineAdapter`, fake SQL engine skeleton을 유지한다.
- M1 UI shell과 M4 Kafka replay demo는 발표/evidence anchor로 유지한다.

## 열린 질문

- Phase 5에서 M3 JSON profile/schema/transform spec 최소 범위와 PR #105 회수 여부를 결정해야 한다.
- Phase 6에서 runner boundary result shape를 결정해야 한다.

## 링크 / 증거

- `docs/project-context/asklake-week2-module-plan/ver2/existing-implementation-anchor.md`
- `backend/app/services/week2_workflow.py`
- `backend/app/services/week2_local_runner.py`
- `backend/app/services/week2_catalog_store.py`
- `backend/app/services/ai_query.py`
- `scripts/kafka_replay_to_parquet_demo.py`
