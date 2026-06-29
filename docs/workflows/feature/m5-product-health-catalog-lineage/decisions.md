# M5 Product-Health Catalog Lineage 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 후보 비교는 생략했다. 사용자가 제공한 계획을 구현하는 slice이며, 핵심 선택은 기존 M5 baseline 유지와 product-health path 추가로 이미 정해져 있었다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Workflow 확장 방식 | pipeline id별 bundle registry | 기존 reviews fixture를 유지하면서 product-health fixture를 독립적으로 추가할 수 있다. | slice 실행, 2026-06-28 |
| product-health runner 연결 | handoff fixture runner | M2/M3 실제 runner가 아직 없으므로 M5 contract와 API/Catalog shape를 먼저 고정한다. | slice 실행, 2026-06-28 |
| run id sequence | `run_product_health_demo_###` 별도 prefix | reviews run sequence와 product-health 발표 run evidence가 섞이지 않는다. | slice 실행, 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 실제 5GB product-health runner 연결 | M2/M3 transform/runtime 결과가 아직 준비되지 않았다. | M2/M3가 `Week2RunnerResult` 호환 output/evidence를 제공할 때 | M2/M3/M5 integration follow-up |
| risk_score 계산식 | M5 책임이 아니라 M3 transform semantics 책임이다. | M3가 `gold_product_health` schema/metric semantics를 freeze할 때 | M3 product-health transform |
| M6 product-health SQL planner | 이번 slice는 M5 Catalog 등록까지다. | M6가 `dataset_product_health_gold`를 query 대상에 추가할 때 | M6 SQL planner follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| handoff fixture runner | 실제 M2/M3 runner가 같은 contract를 만족한다. | fixture runner를 demo fallback으로 낮추거나 adapter 뒤로 교체한다. |
| product-health Catalog schema | M3가 컬럼명이나 metric semantics를 변경한다. | `contracts/catalog_metadata.product_health.sample.json`, `docs/03`, M6 planner tests를 함께 갱신한다. |
