# WSL2 known gaps guidance 계획

## 브랜치

- Branch: `docs/wsl2-known-gaps-guidance`
- Workspace: `docs/workflows/docs/wsl2-known-gaps-guidance`
- Created: 2026-06-24

## 목표

- WSL2 Tier 1 개발 경로를 유지하면서 남은 known gaps를 운영 지침으로 명확히 정리한다.
- 기존 Windows checkout의 CRLF 문제와 WSL Git / Windows Git worktree metadata 혼용 문제를 문서에서 먼저 진단할 수 있게 한다.
- native Windows PowerShell/CMD 지원 범위는 넓히지 않는다.

## 범위

- `docs/04-development-guide.md`의 WSL2 개발 경로, CRLF 재checkout, Git metadata 혼용 금지 지침 보강.
- `docs/manual-verification/00-environment-setup.md`의 Windows WSL2 사전 점검과 실패 시 확인 항목 보강.
- `docs/reports/windows-wsl2-smoke-execution.md`에 과거 evidence를 바꾸지 않는 follow-up note 추가.
- `docs/reports/wsl2-known-gaps-guidance.md` report와 report index 추가.
- branch workspace 기록 완료.

## 범위 제외

- PowerShell/CMD wrapper 구현.
- native Windows 공식 지원 선언.
- 대량 renormalize diff.
- script rewrite.
- Docker/Node/Python version pinning.
- 새로운 제품 기능 Phase 확장.

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
