# Data integration wizard flow 계획

## 브랜치

- Branch: `feature/data-integration-wizard-flow`
- Workspace: `docs/workflows/feature/data-integration-wizard-flow`
- Created: 2026-06-29

## 목표

- 데이터 통합 화면을 AWS 설정 wizard처럼 단계형 설정 흐름으로 보완한다.
- 기존 `Source / Transform / Target / Run` 4개 카드가 한 화면에 모두 펼쳐진 구조를 줄이고, 상단에는 현재 진행 위치를 보여주는 step indicator만 둔다.
- 본문에는 현재 단계 하나만 표시한다.
- 단계는 `1. Source 선택`, `2. Transform 설정`, `3. Target 설정`, `4. Review & Run` 순서로 둔다.

## 범위

- 데이터 통합 화면 UI만 수정한다.
- Source 선택 UI는 기존 source type picker + dataset card selector를 유지한다.
- Transform 설정 UI는 기존 `Select Fields` 체크박스를 유지한다.
- 상단 step indicator는 각 단계의 번호, 이름, 상태를 보여준다.
- `다음` 버튼은 현재 단계 조건을 만족할 때만 활성화한다.
  - 1단계 Source: source dataset 선택 후 다음 가능
  - 2단계 Transform: field가 1개 이상 선택되면 다음 가능
  - 3단계 Target: 이번 Phase에서는 placeholder 또는 비활성 안내만 둔다
  - 4단계 Review & Run: 이번 Phase에서는 preview placeholder만 둔다
- 2단계 이후에는 `뒤로가기` 버튼을 제공한다.
- 임의 단계 점프는 이번 Phase에서 제공하지 않는다.
- 사용자가 흐름을 따라가도록 본문 하단에 `뒤로가기`, `다음` 중심의 navigation을 둔다.

## 범위 제외

- 실제 Target 저장 설정 구현
- 실제 Run 실행 연결
- backend/API/schema 변경
- 실제 pipeline payload 생성
- XFlow식 canvas 구현
- 추가 transform 구현

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/01-product-planning.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `docs/workflows/feature/data-integration-source-type-picker/plan.md`
- `docs/workflows/feature/data-integration-transform-step/plan.md`
- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/01-product-planning.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/15-context-budget-rule.md @docs/workflows/feature/data-integration-source-type-picker/plan.md @docs/workflows/feature/data-integration-transform-step/plan.md

`feature/data-integration-wizard-flow` branch workspace 범위만 구현한다.
데이터 통합 화면을 AWS 설정 wizard처럼 단계형 설정 흐름으로 보완한다.

기존 `Source / Transform / Target / Run` 4개 카드가 한 화면에 모두 펼쳐진 구조를 줄인다.
상단에는 현재 진행 위치를 보여주는 step indicator만 둔다.
본문에는 현재 단계 하나만 표시한다.

단계는 아래 순서로 둔다.
1. Source 선택
2. Transform 설정
3. Target 설정
4. Review & Run

데이터 통합 화면 UI만 수정한다.
Source 선택 UI는 기존 source type picker + dataset card selector를 유지한다.
Transform 설정 UI는 기존 Select Fields 체크박스를 유지한다.
상단 step indicator는 각 단계의 번호, 이름, 상태를 보여준다.

`다음` 버튼은 현재 단계 조건을 만족할 때만 활성화한다.
- 1단계 Source: source dataset 선택 후 다음 가능
- 2단계 Transform: field가 1개 이상 선택되면 다음 가능
- 3단계 Target: 이번 Phase에서는 placeholder 또는 비활성 안내만 둔다
- 4단계 Review & Run: 이번 Phase에서는 preview placeholder만 둔다

2단계 이후에는 `뒤로가기` 버튼을 제공한다.
임의 단계 점프는 이번 Phase에서 제공하지 않는다.
사용자가 흐름을 따라가도록 본문 하단에 `뒤로가기`, `다음` 중심의 navigation을 둔다.

실제 Target 저장 설정, 실제 Run 실행 연결, backend/API/schema 변경, 실제 pipeline payload 생성, XFlow식 canvas, 추가 transform은 구현하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

데이터 통합 화면이 단계형 wizard 구조로 보이는지 확인한다.
한 번에 하나의 단계 본문만 표시되는지 확인한다.
Source 선택 후 2단계 Transform으로 넘어갈 수 있는지 확인한다.
Transform 필드 선택 후 다음 단계로 넘어갈 수 있는지 확인한다.
뒤로가기로 이전 단계에 돌아갈 수 있는지 확인한다.
기존 Source type picker와 Select Fields 기능이 깨지지 않는지 확인한다.
`npm run build`와 `scripts/validate-harness.sh`를 실행한다.
브라우저에서 Source 선택 -> Transform 설정 -> 뒤로가기/다음 흐름을 확인한다.
검증 결과를 `quality.md`와 workspace report에 기록한다.
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

- [x] 데이터 통합 화면이 단계형 wizard 구조로 보인다.
- [x] 한 번에 하나의 단계 본문만 표시된다.
- [x] Source 선택 후 2단계 Transform으로 넘어갈 수 있다.
- [x] Transform 필드 선택 후 다음 단계로 넘어갈 수 있다.
- [x] 뒤로가기로 이전 단계에 돌아갈 수 있다.
- [x] 기존 Source type picker와 Select Fields 기능이 깨지지 않는다.
- [x] 실제 Target/Run/backend/API/schema/payload 범위가 확장되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
