# M3 product-health Gold contract decisions

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 브리프 없음. 사용자가 product-health M3 계약 고정을 직접 요청했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Gold schema | Fixed 12-column `gold_product_health` schema | M1/M6/M5/M2가 같은 컬럼을 소비해야 한다. | user request / 2026-06-28 |
| Zero denominator | Rate metric is `null` when denominator is zero | 근거 없음과 위험 없음이 섞이지 않게 한다. | implementation review / 2026-06-28 |
| Risk score | Source-adaptive policy with L9 approval boundary | 데이터별 component가 다르므로 전역 상수 공식으로 오버피팅하지 않는다. | implementation review / 2026-06-28 |
| Runtime boundary | M3 provides contract/reference validation, M2 owns production Spark execution | M3가 실행 엔진을 소유한다고 과장하지 않는다. | user scope / 2026-06-28 |

## Deferred Decisions / 보류된 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` Source of Truth update | 이번 PR은 product-health contract fixtures를 우선 고정하고, 기존 interface 문서 변경은 별도 M3 expanded contract 작업과 충돌 가능성이 있다. | M2/M5/M6/M1 product-health consumer PR 시작 전 | follow-up M3 interface propagation |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `gold_product_health` schema | M1/M6 demo가 다른 필수 컬럼을 요구한다. | v2 schema를 별도 PR로 추가하고 v1 contract는 보존한다. |
| Risk score policy | owner review가 특정 domain formula를 승인한다. | policy fixture에 approved domain variant를 추가한다. |
