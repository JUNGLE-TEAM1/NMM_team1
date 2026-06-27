# Week2 M1 delivery synthetic auxiliary seed 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: mixed

## Decision Option Briefs / 결정 옵션 브리프

- not needed. M3 답변과 사용자 지시에 따라 delivery seed는 M5/M6 auxiliary synthetic dataset으로 진행한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Taxi source download only | Download source parquet now; defer generated delivery seed contract | 사용자가 "일단 받아와"라고 요청했고, M3 답변상 delivery seed는 auxiliary synthetic dataset으로 별도 계약 검토가 필요함 | user request, 2026-06-27 |
| Delivery seed role | M5/M6 auxiliary synthetic dataset, not M3 main raw | M3 답변에서 실제 배송 원천이 아니라 Taxi 기반 synthetic 보조 raw로 분리해야 한다고 확인함 | user-provided M3 answer, 2026-06-27 |
| Canonical output | `delivery_trips_seed.jsonl` | M3 raw-to-Bronze 추적 관점에서 JSONL이 line/record 단위 추적에 가장 안전함 | user-provided M3 answer, 2026-06-27 |
| Convenience output | Create `delivery_trips_seed.parquet` only if local dependency supports it | Spark/M5/M6에는 유용하지만 dependency를 임의 설치하지 않는 조건이 있음 | user instruction, 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `docs/02-architecture.md` update | 생성물이 실제로 확정된 뒤 영향 여부를 판단한다 | `delivery_trips_seed.jsonl` / parquet copy 생성 완료 | `feature/week2-m1-delivery-seed` |
| `docs/03-interface-reference.md` update | auxiliary delivery source field schema를 구현 결과로 고정한 뒤 판단한다 | delivery seed manifest/summary와 field schema 검증 완료 | `feature/week2-m1-delivery-seed` |
| `docs/05-acceptance-scenarios-and-checklist.md` update | acceptance 변경 필요성을 생성 결과 기반으로 판단한다 | delivery seed를 M5/M6 handoff acceptance로 추가할 때 | `feature/week2-m1-delivery-seed` |
| `docs/06-regression-and-failure-scenarios.md` update | synthetic/source lineage caveat 누락 방지 guard가 실제 구현에 필요한지 확인 후 판단한다 | delivery seed 생성/검증 절차 확정 | `feature/week2-m1-delivery-seed` |
| `docs/07-manual-verification-playbook.md` update | 반복 검증 절차가 구현으로 확정된 뒤 반영한다 | delivery seed 생성/검증 절차 확정 | `feature/week2-m1-delivery-seed` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| delivery seed contract | M5/M6 handoff 전에 generated delivery seed가 필요함 | JSONL canonical + optional Parquet copy 생성 Phase를 이어서 진행한다 |
