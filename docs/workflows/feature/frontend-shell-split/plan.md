# Frontend Shell Split 계획

## Phase

- ID: C-48A
- Branch/work location: `feature/frontend-shell-split`
- Current integration branch: `feature/data-lake-runtime-stack`

## 목표

`frontend/src/app/App.jsx`에서 shell, navigation, route helpers, standalone page composition을 분리한다. 동작은 유지하고 구조만 가볍게 만든다.

## 범위

- `navItems`, route normalization, URL mapping을 route module 기준으로 사용한다.
- App shell/layout/navigation component를 분리한다.
- standalone page entry를 작은 component/module로 분리한다.
- 기존 `features/datasets/SourcesPage` 연결은 유지한다.
- `App.jsx` line count를 줄이고 새 기능 추가 없이 주요 route smoke를 통과한다.

## 제외 범위

- Dataset workspace 내부 상태/action 대분해. C-48B에서 다룬다.
- UI redesign 또는 copy 변경.
- API contract 변경.
- C-49 lake write-through, Catalog/AI Query handoff 구현.
- backend router/store refactor.

## 구현 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md

Implement C-48A only.
Refactor frontend/src/app/App.jsx so app shell, navigation, route helpers, and standalone page composition are separated into small modules/components.
Preserve route behavior, URL aliases, API calls, UI copy, dataset workspace behavior, and demo flows.
Do not implement Product Health lake write-through, AI Query behavior changes, Dataset workspace action refactors, or backend changes in this Phase.
Run frontend build and route smoke checks.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md

Verify C-48A only.
Confirm the same main routes render after App shell split: /connections, /datasets/source, /datasets/silver, /datasets/gold, /jobs/silver-transform, /jobs/gold-build, /runs, /catalog, /query.
Run npm --prefix frontend run build and git diff --check.
Record any deferred Dataset workspace refactor items for C-48B.
```

## Acceptance Criteria

- `App.jsx` no longer owns all navigation/shell/page composition responsibilities.
- Main route aliases and navigation behavior stay the same.
- No backend/API behavior changes are included.
- Frontend build passes.

## Regression / Failure Scenario

- route alias behavior changes if failed.
- menu active state or child menu expansion breaks if failed.
- dataset workspace behavior changes unexpectedly if failed.
