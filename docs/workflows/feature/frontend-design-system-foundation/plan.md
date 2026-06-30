# Frontend design system foundation 계획

## 브랜치

- Branch: `feature/frontend-design-system-foundation`
- Workspace: `docs/workflows/feature/frontend-design-system-foundation`
- Created: 2026-07-01

## 목표

- `frontend/src/app/App.jsx`와 `frontend/src/app/styles.css`에 집중된 공통 UI 책임을 얇은 design system foundation으로 분리한다.
- 후속 `SourcesPage` 도메인 분리를 쉽게 하기 위해 App shell, route mapping, 공통 primitive component의 위치를 먼저 만든다.
- 기능 동작, API contract, dataset/job/query 흐름은 유지한다.

## 범위

- `frontend/src/design-system/` 아래 token CSS와 공통 primitive component를 추가한다.
- `Button`, `Badge`, `PageHeader`, `EmptyState`, `InfoCard`, `DataTable`, `ToastNotice`처럼 이미 여러 화면에서 반복되는 UI 조각을 우선 분리한다.
- `frontend/src/app/routes.js`에 nav item, route normalize/canonical URL, route id mapping을 분리한다.
- `frontend/src/app/AppShell.jsx`에 sidebar/topbar/toast/layout shell을 분리한다.
- `frontend/src/app/App.jsx`는 route별 page component와 도메인 로직을 유지하되 shell/route/primitive import를 사용하도록 줄인다.
- `frontend/src/app/styles.css`는 기존 selector 호환성을 유지하면서 token import와 shell/design-system 관련 스타일 이동을 적용한다.
- workspace 문서에 검증 결과와 남은 도메인 분리 follow-up을 기록한다.

## 범위 제외

- `SourcesPage`의 73개 local state를 도메인 hook으로 전부 분해하지 않는다.
- Connection/Source/Silver/Gold/Jobs/AiQuery API 동작과 payload contract를 바꾸지 않는다.
- React Router, Tailwind, shadcn 등 새 외부 UI dependency를 추가하지 않는다.
- UI redesign, 컬러 테마 전면 교체, 신규 화면 기능 추가를 하지 않는다.
- backend, data pipeline, storage path, catalog/query contract는 변경하지 않는다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
```

## 내부 단계별 프롬프트

- not needed

큰 Phase를 내부 단계로 나누는 경우 아래 양식을 사용한다. 작은 Phase는 이 섹션을 `not needed`로 둔다.

### Step N - [STEP_NAME]

#### 목표

- [STEP_GOAL]

#### 범위

- [STEP_SCOPE]

#### 범위 제외

- [STEP_OUT_OF_SCOPE]

#### 구현 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[IMPLEMENTATION_REQUEST]
```

#### 검증 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[VERIFICATION_REQUEST]
```

#### 완료 기준

- [ ] [STEP_COMPLETION_CRITERION]

## 완료 기준

- [x] design system token/primitive component가 추가되고 기존 화면이 이를 사용한다.
- [x] App shell과 route helper가 `App.jsx` 밖으로 분리된다.
- [x] `npm --prefix frontend run build`가 통과한다.
- [x] 주요 route 정적 확인 또는 browser smoke 결과를 기록한다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
