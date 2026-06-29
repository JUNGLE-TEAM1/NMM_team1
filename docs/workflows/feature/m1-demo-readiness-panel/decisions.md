# M1 demo readiness panel 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 고영향 제품/API 결정 없음. 새 backend readiness API를 만들지 않고 M1이 이미 조회하는 Product Health Catalog readiness에서 발표용 상태를 보수적으로 파생한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Demo readiness source | 기존 Product Health Catalog readiness에서 보수적으로 파생 | 이번 Phase는 M1 UI 보강이며 M2/M3/M5/M6 내부 상태 계산 API를 새로 만들지 않는다. 알 수 없는 상태는 ready로 표시하지 않는다. | AI / 2026-06-29 |
| TDD 생략 | browser smoke + build 검증 | backend/API/contract를 바꾸지 않는 UI-only panel 변경이다. | AI / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Ready 전환 smoke | 실제 `dataset_product_health_gold` CatalogMetadata와 Gold output이 준비된 뒤 M5/M6 항목이 ready로 전환되는지 확인해야 한다. | Product Health integration evidence 완료 후 | 후속 M1/M6 supported CTA SQL success smoke Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Demo readiness labels | M2/M3/M5/M6 책임 경계 또는 Product Health readiness source가 바뀌면 label/detail을 재검토한다. | 후속 UI Hotfix 또는 integration evidence Phase에서 수정 |
