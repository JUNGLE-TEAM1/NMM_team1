# Frontend SourcesPage decomposition 계획

## 브랜치

- Branch: `feature/frontend-sources-page-decomposition`
- Workspace: `docs/workflows/feature/frontend-sources-page-decomposition`
- Created: 2026-07-01

## 목표

- `SourcesPage`와 그 전용 wizard/modal/list helper를 `App.jsx` 밖의 dataset feature boundary로 분리한다.
- 공용 formatter를 `app/formatters.js`로 빼서 feature page와 남은 app page가 함께 쓰게 한다.
- 기능 동작, API contract, route URL, dataset/job/query 흐름은 유지한다.

## 범위

- `frontend/src/features/datasets/SourcesPage.jsx`를 추가하고 Source/Silver/Gold/Jobs dataset workspace 화면을 이 파일로 이동한다.
- `SourcesPage` 전용 constants, connection/source/silver/target mapper/helper, manage modal/list helper를 dataset feature 파일로 이동한다.
- `formatMetric`, `formatBytes`는 `frontend/src/app/formatters.js`로 이동한다.
- `frontend/src/app/App.jsx`는 route shell과 다른 top-level pages만 유지하고 `SourcesPage`를 import해 사용한다.
- `docs/02-architecture.md` frontend layering에 `features/datasets/`를 추가한다.
- local build/static check와 대표 dataset route smoke로 동작 보존을 확인한다.

## 범위 제외

- `SourcesPage` 내부의 70개 이상 local state를 여러 hook으로 전부 분해하지 않는다.
- API payload, endpoint, backend/data/storage/schema contract를 바꾸지 않는다.
- UI redesign, CSS 대규모 이동, React Router 도입, 새 dependency 추가를 하지 않는다.
- Catalog, Run, AI Query page는 formatter import 외에 구조를 바꾸지 않는다.

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

- [x] `SourcesPage` feature boundary 분리 완료
- [x] `App.jsx`가 dataset workspace 구현 세부사항을 직접 포함하지 않음
- [x] `formatMetric`, `formatBytes` shared utility 분리 완료
- [x] `npm --prefix frontend run build` 통과
- [x] 대표 dataset/jobs route smoke 결과 기록
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
