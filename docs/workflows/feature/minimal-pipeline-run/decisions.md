# Minimal pipeline run 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Full Decision Option Brief는 작성하지 않음. 운영 저장소 선택은 M4 범위를 넘고, MVP smoke에는 포트 기반 local adapter가 충분하다고 판단했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M4 result store | local CSV file adapter behind `ResultStore` port | 비용/외부 의존성 없이 pipeline result 위치와 row count를 검증하고, 이후 S3/warehouse로 어댑터 교체 가능 | user M4 진행 지시 / 2026-06-22 |
| M4 runner mode | synchronous service execution | MVP smoke에서 상태 전이와 결과 생성을 즉시 검증하기 쉽고, Airflow/Spark/job queue는 M7/M8 이후 범위 | user M4 진행 지시 / 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Production result storage | S3, warehouse, PostgreSQL table 중 운영 저장소 선택은 비용/배포 target 확정 뒤 결정 | AWS deploy target 또는 M9 catalog metadata 고도화 시점 | M9 또는 infra deployment branch |
| Orchestration engine | Airflow/Spark/K8s Job 필수화는 M4 범위를 넘음 | retry/cancel/schedule, large transform 필요 시 | M8 job-run-management |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| local CSV result store | 결과 파일 관리, 권한, 용량, 동시 실행이 문제가 되면 | S3/warehouse adapter로 교체하고 metadata contract는 유지 |
| synchronous runner | run 시간이 길어지거나 cancel/retry가 필요해지면 | queue/job runner adapter를 추가 |
