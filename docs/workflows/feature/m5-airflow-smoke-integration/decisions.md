# M5 Airflow smoke integration 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- `docs/project-context/asklake-week2-module-plan/ver2/m5-airflow-integration-options.md`

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M5 Airflow smoke 구현 방향 | 별도 Airflow compose + repo DAG + shared local volume + result JSON artifact + adapter read | 사용자가 추천안 구현을 지시했고, 이 조합이 로컬 smoke에서 가장 작게 실제 연결을 증명한다. | user, 2026-06-26 |
| M5 local/demo PR 범위 | Airflow smoke와 M5 demo cockpit UI를 combined M5 local/demo PR 후보로 함께 정리 | 두 변경은 모두 M5 local/demo 책임 종료에 직접 연결되고, 현재 dirty branch가 이미 같은 기반에 있으므로 분리보다 리뷰/검증 정리가 안전하다. | user, 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| production Airflow deployment | 이번 slice는 local smoke 연결만 목표로 한다. | 배포 환경 연결 필요 시 | 후속 infra/deploy phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| result handoff 방식 | shared result JSON이 실제 Airflow smoke에서 깨지거나 팀 표준이 XCom으로 확정될 때 | XCom pointer/result fetch로 변경 |
