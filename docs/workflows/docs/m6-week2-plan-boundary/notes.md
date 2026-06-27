# M6 Week2 plan boundary update 노트

## 진행 메모

- 2026-06-27: 사용자 요청에 따라 M6 개선안을 Week2 ver2 계획 문서에 반영했다.
- 반영 기준은 M6가 M5 CatalogMetadata를 읽기 전용으로 소비하고, SQL 실행은 `SqlEngineAdapter` 뒤에서만 진행하며, response 확장은 additive field로만 한다는 것이다.

## 결정

- 새 고영향 선택은 만들지 않았다. 기존 SQL-first M6 빌드업 방향을 문서에 더 구체적으로 반영했다.

## 열린 질문

- 후속 implementation PR에서 `route`, `retrieval_trace`를 실제 `contracts/ai_query_result.sample.json`과 backend model에 추가할 시점은 별도 contract slice에서 확정한다.

## 링크 / 증거

- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/03-interface-reference.md`
