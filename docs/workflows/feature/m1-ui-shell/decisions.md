# M1 UI Shell 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 고영향 계약 변경은 없었다. 이번 Phase의 주요 선택은 UI 적용 방식이며, `docs/project-context/asklake-week2-module-plan/m1-ui-shell-plan.md`의 “demo 연출 제거, UI shell 먼저 적용” 결정을 따른다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| demo3 frontend 사용 방식 | 전체 복사가 아니라 AskLake M1 shell로 재구성 | `XFlow`/fake demo 동작을 섞으면 후속 테스트와 실제 연결 상태가 오염된다. | 사용자 대화, 2026-06-25 |
| route 구현 방식 | 기존 React 앱 안에서 History API route shell 제공 | M1은 UI shell이 목적이고 새 router dependency가 필수는 아니다. | AI 판단, 2026-06-25 |
| demo 동작 처리 | 전역 mock/auth/자동 완료 제거 | “데모연출을 없애야지 섞이면 테스트 동작을 못한다”는 사용자 우려를 완료 기준으로 반영한다. | 사용자 대화, 2026-06-25 |
| backend 미연결 표현 | pending/empty/error 상태로 표시 | 실제 기능이 없는데 성공처럼 보이는 화면을 만들지 않는다. | AI 판단, 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| source 저장/connection test 상세 UX | M1 범위는 shell까지다. 실제 connector가 붙어야 오류 shape가 확정된다. | M2/M3 source connector 구현 시작 | M2 또는 M3 |
| run polling/retry interaction | M1 범위는 run status surface까지다. 실제 runner contract가 필요하다. | M5 workflow/run 구현 시작 | M5 |
| AI Query evidence display | M1 범위는 AI Query surface까지다. 실제 retrieval/query result가 필요하다. | M6 AI Query 구현 시작 | M6 |
| 공유 Source of Truth 수정 | 기존 `docs/03` Week 2 route/contract package와 M1 plan으로 표현 가능해 수정하지 않는다. | UI route 또는 contract가 `docs/03`과 달라지는 경우 | next impacted Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| History API route shell | 후속 Phase에서 nested route, loader, form state가 복잡해지는 경우 | router 도입을 별도 Phase에서 검토한다. |
| inline contract preview | `contracts/*.sample.json`을 runtime에서 직접 읽는 요구가 생기는 경우 | fixture import 또는 backend contract endpoint를 검토한다. |
