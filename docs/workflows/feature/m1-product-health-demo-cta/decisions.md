# M1 product health demo CTA 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 고영향 제품/API 결정 없음. 기존 M6 SQL planner intent와 route/unsupported 계약을 확장하지 않고 M1 CTA 표시 계층에서만 분리한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Product Health demo CTA grouping | Product Health SQL intents, Unsupported guardrail, Legacy reviews path 3그룹 | 발표자가 지원 질문과 미지원 질문의 차이를 빠르게 보여야 하며, 기존 legacy reviews 경로를 새 대표 경로 완료로 오해하지 않게 분리해야 한다. | AI / 2026-06-29 |
| TDD 생략 | browser smoke + build 검증 | backend planner/API/contract를 바꾸지 않는 UI-only CTA 변경이다. | AI / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Product Health SQL success CTA smoke | `dataset_product_health_gold` CatalogMetadata와 Gold output이 준비된 뒤 실제 supported CTA가 `route=sql`과 DuckDB rows를 반환하는지 확인해야 한다. | Product Health integration evidence 완료 후 | 후속 M1/M6 supported CTA SQL success smoke Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| CTA copy / intent mapping | M6 planner intent keyword 또는 Product Health metric 이름이 바뀌면 CTA 문구와 label을 재검토한다. | 후속 UI Hotfix 또는 M6 intent 변경 Phase에서 수정 |
