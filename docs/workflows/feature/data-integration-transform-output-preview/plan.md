# Data integration transform output preview 계획

## 브랜치

- Branch: `feature/data-integration-transform-output-preview`
- Workspace: `docs/workflows/feature/data-integration-transform-output-preview`
- Created: 2026-06-29

## 목표

- Transform 단계가 `Select Fields`만 지원한다는 점을 명확히 하면서, 선택 결과가 어떤 output schema가 되는지 보여준다.
- 기능 범위는 늘리지 않고 표현을 보강한다.

## 범위

- 데이터 통합 wizard의 Transform 단계만 수정한다.
- 선택된 field만 포함한 `Output schema preview`를 표시한다.
- output preview는 기존 source fixture의 `schema` metadata를 사용한다.
- checkbox 선택/해제와 output preview가 즉시 동기화된다.

## 범위 제외

- Filter, Join, Aggregate, Cast, Rename transform 추가.
- backend/API/schema/payload 변경.
- target/run 연결.
- 실제 transform execution.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `docs/workflows/feature/data-integration-transform-step/plan.md`
- `docs/workflows/feature/data-integration-wizard-flow/plan.md`
- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/15-context-budget-rule.md @docs/workflows/feature/data-integration-transform-step/plan.md @docs/workflows/feature/data-integration-wizard-flow/plan.md

`feature/data-integration-transform-output-preview` branch workspace 범위만 구현한다.
데이터 통합 wizard의 Transform 단계에 선택된 field만 포함하는 `Output schema preview`를 추가한다.
기존 `Select Fields` checkbox 기능은 유지한다.
output preview는 source fixture의 `schema` metadata에서 선택된 field만 필터링해 `field/type/sample` table로 표시한다.
Filter, Join, Aggregate, Cast, Rename transform은 구현하지 않는다.
backend/API/schema/payload는 변경하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

Transform 단계에서 field checkbox 선택/해제 시 output schema preview가 즉시 동기화되는지 확인한다.
선택 field가 0개일 때 empty state가 보이고 다음 단계가 막히는지 확인한다.
`npm run build`와 `scripts/validate-harness.sh`를 실행한다.
브라우저에서 Source 선택 -> Transform 이동 -> field 해제 -> output preview 축소 흐름을 확인한다.
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

- [x] Transform 단계에 `Output schema preview`가 표시된다.
- [x] 선택된 field만 output preview에 남는다.
- [x] Select Fields 기능이 유지된다.
- [x] 추가 transform/backend/API/schema/payload 범위가 확장되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
