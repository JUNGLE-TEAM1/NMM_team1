# Add Source of Truth Impact Gate 계획

## 브랜치

- Branch: `docs/source-of-truth-impact-gate`
- Workspace: `docs/workflows/docs/source-of-truth-impact-gate`
- Created: 2026-06-22

## 목표

- 구현/문서/하네스가 어긋나는 문제를 줄이기 위해 `Source of Truth Impact Gate`를 하네스에 추가한다.
- PR 전 `shared-docs.md`의 Source of Truth 제안이 실제 diff에 반영됐거나 명확히 보류됐는지 확인한다.

## 범위

- workflow, git sync, quality gate, human command flow 문서에 Source of Truth Impact Gate를 명시한다.
- `scripts/status-workflow.sh`에 Source of Truth proposal 상태 표시를 추가한다.
- `scripts/validate-harness.sh --strict`에 unresolved Source of Truth proposal 검사를 추가한다.
- 현재 branch workspace에 변경 이유와 검증 결과를 기록한다.

## 범위 제외

- 제품 런타임 기능 변경.
- 기존 historical workspace 내용을 대량 수정하는 소급 정리.
- 원격 push, PR 생성, merge, deploy.

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

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
