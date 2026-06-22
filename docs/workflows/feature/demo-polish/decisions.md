# Demo polish 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Full Decision Option Brief는 작성하지 않음. M5는 demo reliability polish이며 high-impact architecture choice가 아니다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Frontend API base | same-origin `/api` with Docker nginx proxy | Docker/browser/demo 환경에서 `localhost` API base가 흔들리지 않게 하기 위해 | user M5 진행 지시 / 2026-06-22 |
| Demo defaults | generated source/pipeline/result names | 반복 데모에서 duplicate name 오류로 흐름이 끊기지 않게 하기 위해 | user M5 진행 지시 / 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Environment-specific API base | staging/production deploy가 생기면 `VITE_API_BASE_URL` 또는 ingress path 전략 재검토 | 실제 deploy target 확정 시 | deploy branch |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| same-origin `/api` proxy | ingress/API routing이 달라지면 | frontend nginx config와 deploy manifest를 함께 수정 |
| generated demo names | 사용자가 명시적으로 고정 이름 demo를 요구하면 | seed/reset 기능 또는 demo data reset command 추가 |
