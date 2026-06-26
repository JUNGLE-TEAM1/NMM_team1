# System guardrail application 계획

## 브랜치

- Branch: `docs/system-guardrail-application`
- Workspace: `docs/workflows/docs/system-guardrail-application`
- Created: 2026-06-26

## 목표

- `docs/system-guardrails.md`에 `planned`로 남아 있는 PR linked issue guardrail을 repo-local GitHub Action으로 1차 적용한다.
- 하네스가 사람이 해야 할 판단을 대신 강제하지 않고, PR 통합 단계에서 시스템이 확인 가능한 lifecycle 누락만 감지하도록 만든다.

## 범위

- PR 본문에서 HTML 주석 예시는 제외하고 실제 closing keyword(`Closes #123` 등)를 확인하는 검사 스크립트를 추가한다.
- 예외 PR은 `연결된 Issue: 연결된 issue 없음` 또는 동등한 명시 문구가 있을 때만 통과하도록 한다.
- 새 GitHub Action check를 추가해 PR open/edit/sync/reopen/ready 상태에서 검사를 실행한다.
- 검사 로직의 focused test를 추가하고 기존 CI harness job에서 실행한다.
- `docs/system-guardrails.md`와 branch workspace/report에 적용 상태와 검증 증거를 기록한다.

## 범위 제외

- GitHub repository settings의 branch protection/required check 설정 변경은 실행하지 않는다.
- CODEOWNERS, secret scanning, PR size/risk warning, Project status sync는 이번 Phase에서 구현하지 않는다.
- PR template 구조를 크게 바꾸거나, branch 시작 시점에 issue 생성을 GitHub에서 강제하지 않는다.
- `main` merge, finalize, cleanup은 사람 확인 없이 실행하지 않는다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/system-guardrails.md`
- `.github/pull_request_template.md`
- `.github/workflows/ci.yml`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/system-guardrails.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 PR linked issue guardrail만 구현한다.
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

- [ ] 범위 완료
- [ ] TDD 상태 기록
- [ ] PR linked issue 검사 script와 focused test 통과
- [ ] 새 GitHub Action workflow shape 확인
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
