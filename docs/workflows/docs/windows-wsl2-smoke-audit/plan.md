# Windows WSL2 smoke audit 계획

## 브랜치

- Branch: `docs/windows-wsl2-smoke-audit`
- Workspace: `docs/workflows/docs/windows-wsl2-smoke-audit`
- Created: 2026-06-24

## 목표

- Windows WSL2 + Docker Desktop integration 검증이 필요한 상태를 공식 evidence로 기록한다.
- 현재 macOS 환경에서는 Windows smoke를 실행하지 못했음을 명확히 남긴다.
- Windows에서 실행할 명령, 기대 결과, 실패 시 tooling 후보를 handoff한다.

## 범위

- 현재 실행 환경이 Windows가 아님을 확인한다.
- Windows WSL2에서 실행할 readiness/smoke 명령을 report에 기록한다.
- macOS evidence와 Windows evidence gap을 구분한다.
- stale branch/worktree/unrelated file cleanup은 별도 후보로 기록한다.

## 범위 제외

- Windows WSL2 machine에서 실제 smoke 실행.
- native Windows PowerShell/CMD 지원 구현.
- PowerShell wrapper, Python helper, script rewrite.
- branch 삭제, `.DS_Store` 삭제, unrelated local file 정리.
- push/PR/merge.

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
