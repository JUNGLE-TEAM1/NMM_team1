# Week2 M1 synthetic raw demo sample scale 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed. PR #154의 계약/스크립트를 유지하고 row count/category만 확장한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| scale category | `Health_and_Personal_Care` | review/meta 파일 크기가 Option 2 확장에 적절하고, Gift Cards보다 운영 분석 시나리오에 자연스럽다 | M1 Phase, 2026-06-26 |
| selected option 기록 | `option_2_recommended_mvp_demo` | PR #154의 minimum-start 산출물과 이번 demo_sample 산출물을 manifest/summary에서 구분해야 한다 | M1 Phase, 2026-06-26 |
| Taxi seed | excluded | delivery seed는 M2/M5 경계와 Parquet 산출물 성격이 있어 별도 Phase가 안전하다 | M1 Phase, 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `Electronics` 또는 `Cell_Phones_and_Accessories` category 전환 | 파일 크기가 수 GB 이상이라 이번 scale Phase에는 과함 | 발표 질문이 해당 category를 반드시 요구할 때 | 후속 Phase 후보 |
| Taxi delivery seed | Amazon Reviews demo_sample 확장 우선 | 배송 지연 신호가 M6 질문에 필요할 때 | 후속 `feature/week2-m1-delivery-seed` 후보 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| category suitability | M3/M6가 Health/Personal Care category로 데모 질문 구성이 어렵다고 판단 | 더 적합한 category로 재생성하거나 multi-category generator를 후속으로 만든다 |
