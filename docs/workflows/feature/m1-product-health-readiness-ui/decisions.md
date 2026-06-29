# M1 product health readiness UI 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 고영향 제품/API 결정 없음. 기존 Product Health 계약을 확장하지 않고 M1 표시 계층에서 준비 상태만 분기한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| UI에서 Product Health 미준비 상태 표시 | 기존 Catalog API 소비, backend/data contract 변경 없음 | `gold_product_health` 산출물과 lineage 증거가 아직 없으므로 M1은 fake success 대신 missing/partial/ready 상태만 표시해야 한다. | AI / 2026-06-28 |
| TDD 생략 | browser smoke + build 검증 | 기존 focused UI test harness가 없고 core logic/API를 바꾸지 않는 좁은 UI 변경이다. | AI / 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Product Health Gold 실제 query-ready 표시 | `dataset_product_health_gold` CatalogMetadata, local fallback path, query allowlist, lineage가 실제 M2/M3/M5/M6 흐름으로 닫힌 뒤 확인해야 한다. | 다음 Product Health integration Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| UI-only readiness panel | 실제 ready 상태에서 표시가 부정확하거나 M6 query contract와 충돌하면 panel copy/check mapping을 재검토한다. | Hotfix 또는 다음 M1 UI Phase에서 수정 |
