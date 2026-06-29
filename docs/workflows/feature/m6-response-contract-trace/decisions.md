# M6 response contract route and retrieval trace 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 후보 비교가 필요한 고영향 구조 변경은 아니다. 기존 M6 SQL-first 흐름을 유지하면서 public response field만 additive로 확장한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Public route 값 | `sql`, `rag`, `hybrid`, `unsupported` | 후속 RAG/Hybrid 확장까지 같은 response contract를 유지하기 위해 | user-approved 10-step M6 plan / 2026-06-28 |
| 현재 route 동작 | SQL planner가 지원하는 질문은 성공/blocked 모두 `sql`, 지원하지 않는 질문은 `unsupported` | `local_fallback_path` 누락 같은 guardrail blocked는 SQL route 시도 결과이고, 예측처럼 답할 수 없는 질문은 route 자체가 unsupported이기 때문 | AI implementation / 2026-06-28 |
| trace 최소 단위 | Catalog trace item 1개 | 현재 검색 단위가 CatalogMetadata selection이므로 source id, score, matched terms, evidence link를 먼저 공개한다. | AI implementation / 2026-06-28 |
| 계약 방식 | Additive field | 기존 M1이 `status`, `sql`, `query_result`, `rows`, `summary`, `evidence`만 읽어도 깨지지 않게 하기 위해 | AI implementation / 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `rag` route 실제 실행 | 이번 Phase는 response contract만 추가한다. | Catalog RAG index가 구현될 때 | M6 Catalog RAG Index |
| `hybrid` route 실제 실행 | SQL 결과와 RAG evidence 결합 로직이 아직 없다. | SQL + RAG evidence 결합이 필요할 때 | M6 Hybrid Route |
| `schema`, `metric`, `lineage`, `chunk` trace item 다중 생성 | 현재 retrieval source가 CatalogMetadata 단위이다. | schema/metric/lineage/chunk index가 생길 때 | M6 RAG/Hybrid 후속 |
| M1 route/trace UI 표시 | M1 소유 UI 변경이다. | M1이 richer evidence 표시 Phase를 열 때 | M1 follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `route=sql` for SQL guardrail blocked | M1/사용자가 blocked를 별도 route로 요구하거나 contract에 `blocked` route가 추가될 때 | `docs/03`에서 route enum을 먼저 변경하고 M6/M1을 함께 조정한다. |
| Catalog-only trace | RAG index가 schema/metric/lineage/chunk별 점수를 만들 때 | trace item 생성기를 index source별로 확장한다. |
