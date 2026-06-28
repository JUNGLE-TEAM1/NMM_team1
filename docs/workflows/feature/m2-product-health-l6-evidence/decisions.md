# M2 Product Health 실제 L6 실행 증거 생성 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Small Product Health L6 evidence scope | source 4종 evidence + reviews 기반 L6 Gold preview + SQL read smoke | 작은 데이터로 실행 경로를 먼저 닫고, 최종 metric semantics와 5GB run은 후속으로 분리해야 책임 경계가 깨지지 않는다. | user "그래 진행해" / 2026-06-28 |
| Final metric ownership | M3 owns `negative_review_rate`, `conversion_rate`, `late_delivery_rate`, `risk_score` semantics | M2가 임의 공식으로 최종 Gold 의미를 확정하면 M3/M6 계약과 충돌한다. | docs/project-context ver2 + M2 implementation / 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 5GB Product Health input run | 이번 Phase는 작은 L6 evidence이며 5GB source bundle이 아직 준비되지 않았다. | 5GB reviews/behavior/delivery/product input bundle path가 확정될 때 | `feature/m2-product-health-scale-evidence` 후보 |
| Docker Spark cluster | 로컬 runner evidence를 먼저 닫고 cluster runtime은 별도 검증한다. | local evidence PR merge 후 또는 Spark cluster config가 준비될 때 | M2 scale/runtime Phase |
| Airflow DAG 내부 SparkRunner 호출 | M5 소유 orchestration 범위다. | M5가 Airflow DAG runner 호출 지점을 확정할 때 | M5/M2 integration Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Small Product Health L6 evidence | M3가 최종 Product Health metric spec을 확정해 현재 preview spec과 충돌할 때 | sample spec을 M3 최종 spec fixture로 교체하고 smoke를 재실행한다. |
