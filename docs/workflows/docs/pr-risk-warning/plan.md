# PR risk warning 계획

## 브랜치

- Branch: `docs/pr-risk-warning`
- Workspace: `docs/workflows/docs/pr-risk-warning`
- Created: 2026-06-26

## 목표

- PR 크기와 위험 경로를 시스템이 자동 요약해 리뷰어에게 경고로 보여준다.
- PR 크기 판단을 하네스 규칙으로 강제하지 않고, GitHub Action warning과 step summary로 사람이 판단할 수 있는 근거를 제공한다.

## 범위

- PR diff의 changed files, additions, deletions를 계산하는 repo-local script를 추가한다.
- 위험 경로 후보(`.github/`, `scripts/`, `docs/03`, `docs/12`, `infra/`, `contracts/` 등)를 감지해 summary와 warning으로 남긴다.
- 기본 threshold를 넘으면 warning을 출력하되 check는 실패시키지 않는다.
- focused test를 추가하고 기존 CI harness job에서 실행한다.
- `docs/system-guardrails.md`의 `PR size/risk warning` 상태를 실제 적용 상태로 갱신한다.

## 범위 제외

- PR size/risk warning을 hard gate로 만들지 않는다.
- override label, CODEOWNERS, secret scanning, branch protection required check 설정은 이번 Phase에서 구현하지 않는다.
- 제품 기능, API/schema, data migration은 변경하지 않는다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/system-guardrails.md`
- `.github/workflows/ci.yml`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/system-guardrails.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 PR risk warning 작업만 구현한다.
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
- [x] PR risk warning script와 focused test 통과
- [x] GitHub Action warning workflow shape 확인
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
