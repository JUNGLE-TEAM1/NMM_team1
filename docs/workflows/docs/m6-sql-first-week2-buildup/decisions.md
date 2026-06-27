# M6 SQL-first 2주차 빌드업 계획 보강 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 후보 비교가 필요한 고영향 구조 변경은 아니다. 사용자의 지적에 따라 기존 M6 장기 방향을 유지하되, 2주차 후속 실행 우선순위를 SQL MVP로 정렬하는 문서-only 변경이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M6 후속 우선순위 | SQL MVP 먼저 | 현재 M6는 template SQL/fake SQL 수준이므로 RAG/LLM을 먼저 붙이면 근거 없는 답변 위험이 커진다. | user correction / 2026-06-27 |
| 2주차 RAG/LLM 범위 | 후속 확장 | M6 최종 방향에는 포함하되 2주차 실행 범위로 오해하지 않게 한다. | user direction / 2026-06-27 |
| M5 Catalog 관계 | 읽기 전용 소비 | Catalog 저장/API는 M5 소유이며 M6가 수정하면 M5와 충돌한다. | AI implementation / 2026-06-27 |
| 계약 변경 | 이번 Phase에서는 없음 | `docs/03`에 SQL adapter 경계가 이미 있고, route/retrieval_trace 같은 새 field는 아직 구현하지 않는다. | AI implementation / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `AIQueryResult.route`, `retrieval_trace` 추가 | 이번 Phase는 계획 문서 보강이며 API/schema 변경이 아님 | SQL MVP 구현 후 route/retrieval trace가 필요할 때 | M6 contract/interface Phase |
| external vector DB, full document RAG, real LLM provider 연결 | SQL MVP 이전에 붙이면 범위가 커지고 근거 없는 답변 위험이 커짐 | SQL MVP와 CatalogMetadata 기반 RAG가 안정화된 뒤 | post-SQL MVP M6 AI expansion |
| 범용 NL2SQL | Week2 대표 경로보다 훨씬 큰 문제이며 guardrail 위험이 큼 | 대표 경로 SQL planner가 안정화된 뒤 | post-Week2 research/design |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| SQL-first 우선순위 | 팀이 2주차 발표 범위에서 RAG/LLM demo를 SQL MVP보다 우선하기로 명시 결정할 때 | 별도 Decision Option Brief와 `docs/03`/contracts 변경 Phase를 연다. |
| M5 Catalog read-only | M6 index/cache가 Catalog state를 저장해야 할 필요가 생길 때 | M5/M6 shared contract를 별도 Phase로 정의한다. |
