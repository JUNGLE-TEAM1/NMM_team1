# M6 Catalog retrieval scoring 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 Decision Option Brief가 필요한 고영향 선택은 없었다. 공유 contract/schema를 바꾸지 않고 M6 내부 retrieval scoring만 분리했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Catalog 선택 로직 위치 | `CatalogRetriever` service | `Week2AIQueryService`가 orchestration/response assembly에 집중하고 retrieval scoring을 독립 테스트 가능하게 한다. | AI implementation / 2026-06-26 |
| Retrieval 방식 | lightweight token/alias scoring | Week2 기본 범위는 CatalogMetadata 기반 RAG-lite이며 external vector DB/full RAG가 아니다. | AI implementation / 2026-06-26 |
| 공유 contract 변경 | 변경 없음 | `selected_datasets.reason` 문자열 품질만 개선하고 response shape는 유지한다. | AI implementation / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| M5 real Catalog source adapter | M5 API/store shape가 아직 이 slice 입력으로 고정되지 않았다. | M5 catalog source contract가 안정될 때 | M6/M5 integration slice |
| embedding/vector retrieval | Week2 기본 범위 제외이며 현재는 RAG-lite token scoring이다. | 팀이 full semantic retrieval을 발표 범위로 승격할 때 | post-Week2 또는 별도 Decision Phase |
| non-review SQL planner | 이번 scope는 catalog retrieval이며 SQL planner 확장이 아니다. | Amazon Reviews 외 dataset을 M6 성공 실행 대상으로 삼을 때 | M6 SQL planner follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| lightweight token scoring | 질문/metadata 단서가 늘어나 false positive가 많아진다. | scoring 가중치/alias를 별도 테스트와 함께 조정한다. |
| 공유 contract 변경 없음 | retrieval trace, score, matched_terms를 API field로 노출해야 한다. | `docs/03-interface-reference.md`와 contracts 변경 Phase를 연다. |
