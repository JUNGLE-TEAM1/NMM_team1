# Final evidence cleanup 계획

## 브랜치

- Branch: `hotfix/final-evidence-cleanup`
- Workspace: `docs/workflows/hotfix/final-evidence-cleanup`
- Created: 2026-06-26

## 목표

- merge/finalize 완료된 PR #136, PR #138의 workspace evidence를 실제 원격 상태와 일치시킨다.
- 기능 코드와 guardrail 동작은 변경하지 않고 기록 정합성만 복구한다.

## 범위

- `docs/workflows/docs/system-guardrail-application/`의 `sync.md`, `report.md`, `next-actions.md` final evidence 갱신.
- `docs/workflows/docs/pr-risk-warning/`의 `sync.md`, `report.md`, `next-actions.md` final evidence 갱신.
- PR/issue/Project 원격 상태를 `gh`로 확인하고 Hotfix report에 기록.

## 범위 제외

- `.github/`, `scripts/`, `tests/` 기능 변경.
- 새 guardrail 추가.
- branch protection, required check, CODEOWNERS, secret scanning 설정 변경.
- merge/finalize/cleanup 재실행. 이미 완료된 원격 상태를 문서에 반영만 한다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/workflows/docs/system-guardrail-application/sync.md`
- `docs/workflows/docs/system-guardrail-application/report.md`
- `docs/workflows/docs/system-guardrail-application/next-actions.md`
- `docs/workflows/docs/pr-risk-warning/sync.md`
- `docs/workflows/docs/pr-risk-warning/report.md`
- `docs/workflows/docs/pr-risk-warning/next-actions.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 final evidence cleanup만 구현한다.
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
