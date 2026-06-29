# M5 direct spark_runner 제거 Hotfix 결정

이 파일은 고영향 선택과 그 결과를 기록한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

-

## Accepted Decisions / 확정된 결정

| Decision | Selected option | Reason | Date |
| --- | --- | --- | --- |
| M5 executor 허용값 | `local_runner`, `airflow`만 허용 | Airflow와 Spark를 같은 선택지로 두면 최종 구조가 잘못 보인다. Spark는 Airflow DAG 내부 task 또는 별도 통합에서 다룬다. | 2026-06-29 |
| M2 Spark smoke 보존 | `Week2SparkRunner` 자체는 유지 | 이번 문제는 M5 direct API 선택지 혼동이며, M2 runtime smoke 삭제가 아니다. | 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Airflow DAG 내부 Spark 호출 | 이번 hotfix는 direct executor 제거만 다룬다. | Airflow DAG가 실제 Spark job을 호출하는 통합을 시작할 때 | 별도 M5/M2 integration Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| M5 executor 허용값 | direct Spark API 선택지가 명시적으로 다시 필요하다는 팀 결정이 생기면 | `docs/14` decision brief로 Airflow DAG 내부 Spark 호출과 비교 후 재도입 여부 판단 |
