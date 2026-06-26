# M2 Workflow runner 연동 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 고영향 후보 비교는 열지 않는다. 이미 확정된 runner boundary에서 `Week2WorkflowService`가 M2 `Week2SparkRunner`를 호출하는 후속 연동만 수행한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M2/M5 연결 방식 | `spark_runner`를 `Week2WorkflowService` executor 선택지로 추가 | M5가 실행 지휘자이고 M2가 runtime provider라는 ver2 책임 분리와 맞는다. M1 UI는 backend API 소비자라 이번 PR에서 직접 수정하지 않는다. | 사용자 진행 지시 / 2026-06-27 |
| transformation 범위 | 이번 PR은 Parquet runtime boundary만 연결 | M3 Bronze/Silver/Gold semantics는 M3 책임이며, 이번 작업에 섞으면 M2/M3 책임 경계가 흐려진다. | 사용자 진행 지시 / 2026-06-27 |
| Airflow 범위 | Airflow DAG 내부 Spark 호출은 제외 | 현재 M5 adapter fallback 구조를 깨지 않고, 먼저 direct `spark_runner` executor 경로를 열어 검증한다. | 사용자 진행 지시 / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Airflow DAG에서 SparkRunner 호출 | Airflow 운영 경로는 M5 adapter/DAG 계약이 더 필요하다. | M5가 external Airflow 실행 경로를 실제 DAG로 연결할 때 | M5 Airflow integration follow-up |
| M3 TransformSpec 실행 | 이번 M2 runner는 아직 transform semantics를 소유하지 않는다. | M3 TransformSpec/job logic이 확정되고 M5가 실행 입력으로 넘길 때 | M2/M3/M5 transform integration |
| MinIO/S3 write | 이번 PR은 local Parquet path evidence에 한정한다. | storage target을 local에서 MinIO/S3-compatible로 승격할 때 | storage integration follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
|  |  |  |
