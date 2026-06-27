# M5 Airflow integration option guide 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- `docs/project-context/asklake-week2-module-plan/ver2/m5-airflow-integration-options.md`

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M5 Airflow 실제 연결 조합 | 별도 Airflow compose + repo DAG + shared local volume + result JSON artifact + smoke에서 fallback 숨김 방지 | 로컬 개발/발표 기준으로 가장 작게 실제 Airflow 경로와 Catalog 저장을 증명할 수 있다. | user, 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| production Airflow deployment | 이번 목표는 local smoke 연결이다. | 배포/운영 환경이 목표가 될 때 | 후속 infra/deploy phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| result handoff 방식 | shared result JSON으로 실제 smoke가 어렵거나 Airflow XCom 계약이 팀 표준으로 확정될 때 | XCom pointer 또는 XCom result fetch로 재검토 |
