# Dataset create type choice 계획

## 브랜치

- Branch: `feature/dataset-create-type-choice`
- Workspace: `docs/workflows/feature/dataset-create-type-choice`
- Created: 2026-06-29

## 목표

- `데이터셋 생성` 버튼을 누르면 Source Dataset과 Target Dataset 중 무엇을 만들지 먼저 고르게 한다.
- 이후 Source/Target wizard를 분리할 수 있는 진입 구조를 만든다.

## 범위

- `데이터셋 생성` CTA를 선택 modal 또는 dialog와 연결한다.
- modal에 `Source Dataset`과 `Target Dataset` 선택 카드를 표시한다.
- 선택 결과를 local UI state로 저장하고, 각각의 wizard shell 또는 placeholder 진입점으로 이동시킨다.
- 기존 Target Dataset prototype 화면은 Target 선택 시 재사용 가능한 임시 진입점으로 둔다.

## 범위 제외

- Source Dataset 생성 세부 단계 구현.
- Target Dataset 5단계 wizard 완성.
- 실제 connector/API/job 생성.
- backend/API/schema 변경.

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

`feature/dataset-create-type-choice` branch workspace 범위만 구현한다.
`데이터셋 생성` CTA를 Source Dataset / Target Dataset 선택 modal과 연결한다.
선택 결과는 local UI state로 처리하고, 각 선택이 후속 wizard shell 또는 placeholder 진입점으로 이어지게 한다.
Source Dataset 세부 wizard, Target Dataset 5단계 완성, 실제 connector/API/job 생성, backend/API/schema 변경은 구현하지 않는다.
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

- [x] `데이터셋 생성` 버튼에서 Source/Target 선택 modal이 열린다.
- [x] Source Dataset과 Target Dataset 선택지가 의미 차이를 짧게 설명한다.
- [x] 선택 후 각 wizard mode 또는 placeholder 진입점으로 이동한다.
- [x] backend/API/schema 변경 없이 local demo state로 동작한다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
