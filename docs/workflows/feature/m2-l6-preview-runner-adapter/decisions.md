# M2 L6 preview runner adapter 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 option brief는 작성하지 않는다. 이번 선택은 M3 L6 계약을 소비하는 additive runner adapter이며, 고비용 infra 또는 제품 방향 변경이 아니다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| L6 preview spec runtime handoff | `RuntimeConfig.transform_spec` / `transform_spec_path`를 M2 `spark_runner`가 소비한다. | M3가 L6 spec 의미를 소유하고 M2가 preview 실행/evidence만 맡는 기존 책임 분리를 유지하면서, M5가 inline spec 또는 artifact path 방식으로 넘길 수 있다. | 사용자 “그래 진행하자” 및 “머지하고 다음꺼 진행해”, 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Docker Spark cluster | 이번 PR은 local preview adapter만 닫고, Docker Spark는 scale/runtime Phase에서 다룬다. | M2 최종 목표에는 필요하지만 이 PR 범위에 넣으면 Airflow/infra와 엮여 PR이 커진다. | 후속 M2 Spark cluster/scale evidence Phase |
| Airflow DAG-internal SparkRunner invocation | M5와 별도 integration Phase에서 다룬다. | 이번 PR은 M5가 직접 `spark_runner`를 호출할 수 있는 runner boundary를 먼저 검증한다. | M5 Airflow wiring Phase |
| 5GB Product Health input evidence | input 묶음 준비 뒤 같은 runner 경로로 재실행한다. | 현재 목표는 L6 spec adapter 기능 검증이다. | 5GB raw/bronze input 준비 완료 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| L6 preview spec runtime handoff | M3 L6 spec schema가 `operations[].operation` / `params` 중심에서 바뀌거나 M5가 artifact path만 허용하도록 바뀌는 경우 | `RuntimeConfig` field와 adapter loader를 새 handoff 방식에 맞춰 조정한다. |
