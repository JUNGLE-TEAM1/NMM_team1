# Dataset section reframe 계획

## 브랜치

- Branch: `feature/dataset-section-reframe`
- Workspace: `docs/workflows/feature/dataset-section-reframe`
- Created: 2026-06-29

## 목표

- 데모 주 화면 명칭과 목적을 `데이터 통합`에서 `데이터셋`으로 재정의한다.
- 사용자가 이 화면을 "pipeline 실행기"가 아니라 source/target dataset을 만들고 관리하는 곳으로 이해하게 한다.

## 범위

- nav label, page title, 주요 CTA, empty/helper copy를 `데이터셋` 중심으로 조정한다.
- 기존 source 선택, transform output preview, target 이름 입력 데모 state는 깨지지 않게 유지한다.
- generic pipeline/job/run wording은 다음 Phase에서 재사용할 수 있는 수준으로만 남기거나 숨긴다.

## 범위 제외

- Source Dataset / Target Dataset 선택 modal 구현.
- Source Dataset 생성 wizard 구현.
- Target Dataset 생성 wizard 단계 재구성.
- backend/API/schema 변경.
- 기존 데이터 통합 prototype workspace 삭제.

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

`feature/dataset-section-reframe` branch workspace 범위만 구현한다.
데모 주 화면을 `데이터셋` 중심으로 보이게 nav label, page title, 주요 CTA, helper copy를 조정한다.
기존 source/transform/target demo state는 유지하고, generic pipeline/job/run wording은 최소화한다.
Source/Target 선택 modal, Source Dataset wizard, Target Dataset wizard 재구성, backend/API/schema 변경은 구현하지 않는다.
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

- [x] 화면 명칭과 주요 CTA가 `데이터셋` 중심으로 보인다.
- [x] 사용자가 이 화면을 source/target dataset 생성 진입점으로 이해할 수 있다.
- [x] 기존 source 선택, transform output preview, target 이름 입력 state가 깨지지 않는다.
- [x] Source/Target 선택 modal과 신규 wizard는 추가되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
