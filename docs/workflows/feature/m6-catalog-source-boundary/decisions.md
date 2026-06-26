# M6 CatalogSource 경계 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 후보 비교 문서가 필요한 고영향 선택은 없었다. 공유 interface/schema를 바꾸지 않고 내부 adapter 경계만 추가했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M6 catalog 조회 경계 | `CatalogSource` protocol + fixture adapter | M5 실제 source로 바꾸기 전에 M6 service의 fixture 파일 직접 의존을 제거할 수 있다. | AI implementation / 2026-06-26 |
| 기본 runtime source | `FixtureCatalogSource` container 주입 | 기존 `POST /api/week2/ai/query` smoke와 fixture 기반 demo path를 유지한다. | AI implementation / 2026-06-26 |
| 공유 contract 변경 | 변경 없음 | `AIQueryResult`, `CatalogMetadata`, route contract를 유지하는 내부 구조 변경이다. | AI implementation / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| real M5 Catalog source adapter | M5 catalog store/API shape가 아직 이 slice의 입력 contract로 고정되지 않았다. | M5 source contract 또는 runtime endpoint가 확정될 때 | 후속 M6/M5 integration slice |
| real SQL runtime adapter | 이번 범위는 fake `SqlEngineAdapter` 유지와 service boundary 분리다. | M2 runtime path와 M5 output location이 안정될 때 | Week2 data path integration |
| external LLM/vector DB/full RAG | Week2 M6 범위 제외이며 현재는 RAG-lite/semantic evidence path 중심이다. | post-Week2 AI interpretation 계획 확정 시 | post-MVP 또는 별도 Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `CatalogSource` protocol | M5 source가 catalog list 외에 pagination/auth/session context를 필수로 요구한다. | adapter protocol을 확장하고 `docs/03-interface-reference.md` 변경 필요 여부를 검토한다. |
| 공유 contract 변경 없음 | `AIQueryResult.evidence` 또는 `CatalogMetadata` shape를 바꿔야 한다. | 별도 contract/interface Phase로 분리한다. |
