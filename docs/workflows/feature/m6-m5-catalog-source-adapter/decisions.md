# M6 M5 CatalogSource adapter 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed. 기존 M6 `CatalogSource` 경계와 M5 `Week2CatalogStore`를 직접 연결하는 작은 adapter slice이며 public contract나 외부 dependency를 바꾸지 않는다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M5 catalog source adapter 위치 | `Week2CatalogStoreSource` adapter | M6 service가 M5 store 구현 세부를 직접 알지 않고 기존 `CatalogSource` protocol만 소비하게 한다. | AI implementation / 2026-06-26 |
| empty catalog fallback | M5 store 우선, 비어 있으면 fixture fallback | workflow run 전 기존 fixture-backed smoke와 demo path를 보존하면서 run 이후에는 M5 최신 catalog를 우선한다. | AI implementation / 2026-06-26 |
| app container wiring | `Week2CatalogStore`를 container에서 공유 | M5 workflow run이 저장한 catalog를 M6 query가 같은 store root에서 읽게 한다. | AI implementation / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| real SQL runtime adapter | 이번 slice는 catalog source 연결만 다룬다. | M2 SQL runtime smoke 또는 DuckDB adapter 범위가 확정될 때 | 후속 M6/M2 integration slice |
| external vector DB/full RAG/real LLM | Week2 기본 범위 밖이며 별도 결정이 필요하다. | post-Week2 AI interpretation 계획 확정 시 | post-MVP 또는 별도 Phase |
| 공유 Source of Truth 문서 업데이트 | 이번 작업은 기존 `CatalogSource`, `CatalogMetadata`, `AIQueryResult` contract 안의 내부 adapter/wiring 변경이다. | adapter protocol, public route, response schema가 바뀔 때 | 해당 contract 변경 Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `Week2CatalogStoreSource` | M5 store가 pagination/auth/session context를 필수로 요구하게 된다. | `CatalogSource` protocol 확장과 `docs/03-interface-reference.md` 영향 여부를 검토한다. |
| fixture fallback | 발표 기본 path에서 workflow run 전 AI query를 더 이상 지원하지 않기로 결정한다. | fallback 제거 여부를 별도 Phase에서 검토한다. |
