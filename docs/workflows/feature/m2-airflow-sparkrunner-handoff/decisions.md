# M2 Airflow SparkRunner handoff 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 이번 작업은 M5 Airflow DAG 내부 구현을 확장하지 않고, M2가 소유하는 CLI handoff artifact만 추가한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Airflow 통합 방식 | M2 CLI artifact handoff | Airflow service/DAG/polling/Catalog는 M5 책임이고, M2는 runner 실행 결과만 `week2_result`로 제공하면 책임 경계가 섞이지 않는다. | user request / 2026-06-29 |
| Spark direct S3 write | 다음 Phase로 분리 | 이번 Phase의 목적은 M5 Airflow 통합 지원이며, 사용자가 두 작업을 차례로 진행하라고 했으므로 AGENTS의 작업 하나=Phase 하나 규칙을 따른다. | user request / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Real Airflow container E2E | M5 PR에서 DAG task 연결 후 확인해야 한다. | M5 Airflow DAG가 M2 CLI를 실제로 호출할 때 | M5 Airflow integration |
| Product Health 5GB handoff profile | M1/M3의 5GB input과 최종 TransformSpec이 필요하다. | Product Health 5GB 입력과 spec 준비 완료 | 후속 M2 evidence Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| CLI handoff | M5가 subprocess가 아니라 다른 실행 방식을 확정할 경우 | CLI는 유지하되 wrapper script 또는 DAG operator 호출 방식만 조정 |
