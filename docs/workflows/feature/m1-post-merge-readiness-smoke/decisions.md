# M1 post-merge readiness smoke 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 고영향 제품/API 결정 없음. 이번 Phase는 최신 main smoke와 M1 UI overflow 보완이며 backend/API/schema/data contract를 바꾸지 않는다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Product Health ready 표시 기준 | 최종 `dataset_product_health_gold` CatalogMetadata/Gold output 부재 시 ready로 올리지 않음 | fake success 방지 기준을 유지하고 현재 main/로컬에 final Product Health evidence가 없음을 smoke로 확인했다. | AI / 2026-06-29 |
| 모바일 overflow 보완 | 640px 이하 `.page-header` 좌우 음수 margin 제거 | `/query` mobile smoke에서 `.page-stack` overflow가 발견되어 최소 CSS 보정으로 해결했다. | AI / 2026-06-29 |
| 보완 프롬프트 반영 | 모바일 overflow fix와 stale M1 report 문구 정리 | 검수 결과를 즉시 반영해 smoke evidence와 문서 상태를 일치시켰다. | AI / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Product Health SQL success smoke | final `dataset_product_health_gold` CatalogMetadata/Gold output이 아직 없어 supported CTA `route=sql` 성공을 검증할 수 없다. | M3 PR #245 또는 Product Health final evidence merge 후 | 후속 M1 Product Health SQL success smoke Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 모바일 layout 보정 | 다른 화면의 full-bleed header 요구가 생기거나 640px 이하 page header 디자인 회귀가 발견될 때 | 해당 화면 smoke 후 CSS selector를 더 좁힌다. |
| Product Health readiness | 최종 Gold/Catalog evidence가 merge되었는데도 M2/M3/M5/M6가 not-ready/blocked로 남을 때 | M1 readiness 파생 로직 또는 upstream CatalogMetadata shape를 재검토한다. |
