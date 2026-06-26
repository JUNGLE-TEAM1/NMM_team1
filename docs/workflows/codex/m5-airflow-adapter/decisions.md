# M5 Airflow Adapter 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 후보 비교는 생략했다. 이번 slice는 기존 ver2 책임 분리에서 이미 M5 소유로 정의한 Airflow adapter 경계를 구현하는 작업이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 실제 Airflow 서버 실행 | 이번 slice에서 제외 | 로컬/CI에서 안정적으로 검증하려면 먼저 fake HTTP client로 adapter 계약을 고정해야 한다. | slice start, 2026-06-26 |
| 성공 판정 | Airflow state success + `week2_result.output_path` 필요 | DAG 성공만으로는 Catalog publish evidence가 부족하다. | slice start, 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 실제 Airflow smoke | Airflow webserver/scheduler/DAG runtime 준비가 필요하다. | Airflow runtime을 띄우는 compose 또는 local setup이 준비될 때 | M5 Airflow runtime smoke follow-up |
| DAG result payload contract Source of Truth 반영 | 이번 slice에서 code/test로 먼저 경계를 검증한다. | 실제 DAG 구현 또는 M3/M2 result handoff와 맞출 때 | Airflow DAG integration follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| fake HTTP boundary | 실제 Airflow API shape와 다르면 | adapter parser와 tests를 실제 response fixture에 맞춘다. |
| `week2_result.output_path` 요구 | output evidence를 다른 방식으로 받게 되면 | result extraction contract를 갱신한다. |
