# Week2 M1 delivery location enrichment 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: mixed

## Decision Option Briefs / 결정 옵션 브리프

- not needed. M5 피드백과 기존 M3/M6 boundary에 맞춘 low-risk lineage/enrichment follow-up이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Delivery source role | Keep as M5/M6 auxiliary synthetic dataset | M3 main raw와 synthetic auxiliary source를 섞지 않는 기존 결정 유지 | PR #180 + user request, 2026-06-27 |
| Location ID preservation | Add source pickup/dropoff location IDs | 원본 Taxi row의 `PULocationID`, `DOLocationID` lineage를 최종 row에 보존 | M5 feedback, 2026-06-27 |
| Zone enrichment | Use TLC Taxi Zone lookup when available | borough/zone별 late/cost-distance aggregation을 가능하게 함 | M5 feedback, 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Shared interface formalization | M5/M6 소비 query가 확정된 뒤 정식 계약 반영 여부를 판단 | 실제 소비 surface가 아직 구현되지 않음 | M5/M6 consumption Phase |
| DuckDB dependency | M6 SQL adapter Phase에서 판단 | 현재 Phase는 seed generation 보강이며 SQL engine adapter 구현이 아님 | M6 SQL adapter Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Taxi Zone lookup unavailable | location ID만 보존하고 borough/zone은 null 허용 | `source_pickup_location_id`, `source_dropoff_location_id` 검증은 유지 |
