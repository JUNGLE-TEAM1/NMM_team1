# Frontend design system foundation 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 고영향 계약 변경은 없었다. 이번 Phase의 주요 선택은 UI foundation 분리 순서이며, 새 external dependency나 API contract 변경은 만들지 않는다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| foundation 적용 순서 | design-system primitive, AppShell, routes 분리를 먼저 적용 | 후속 `SourcesPage` domain split 전에 shell/route/common UI 경계를 만들어야 중복 extraction을 줄일 수 있다. | 사용자 진행 지시 + AI 판단, 2026-07-01 |
| UI dependency | 기존 React/Vite/lucide/class 기반 구현 유지 | Tailwind/shadcn/React Router 도입은 churn과 검증 범위를 키우므로 이번 구조 foundation 범위에서 제외한다. | AI 판단, 2026-07-01 |
| Source of Truth 반영 | `docs/02-architecture.md` frontend layering만 갱신 | API/schema/acceptance/manual procedure는 변경하지 않고 architecture layer description만 실제 코드 구조에 맞춘다. | AI 판단, 2026-07-01 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `SourcesPage` domain state split | 이번 Phase는 foundation 범위이며 domain state/API/view 분해는 blast radius가 크다. | `SourcesPage` state ownership map 작성 또는 dataset workspace 기능 변경 시작 | next frontend refactor Phase |
| React Router 도입 | 현재 History API route shell로 기존 동작을 보존할 수 있다. | nested routes, route loaders, form transition state가 필요해지는 경우 | 별도 routing Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| AppShell/routes extraction | 대표 route smoke에서 shell/sidebar/page header가 깨지거나 path normalization이 달라지는 경우 | `frontend/src/app/AppShell.jsx`, `frontend/src/app/routes.js`, 관련 `App.jsx` import/usage를 rollback 또는 hotfix한다. |
| design-system primitive wrapper | 기존 class selector 호환성이 깨져 시각 regression이 발생하는 경우 | wrapper 범위를 줄이고 해당 primitive를 feature-local component로 되돌린다. |
