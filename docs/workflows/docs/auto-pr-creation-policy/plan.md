# Auto PR creation policy 계획

## 브랜치

- Branch: `docs/auto-pr-creation-policy`
- Workspace: `docs/workflows/docs/auto-pr-creation-policy`
- Created: 2026-06-25

## 목표

- PR-ready 조건을 통과한 branch는 사람의 추가 승인 없이 feature branch push와 PR 생성을 자동 진행할 수 있도록 하네스 정책과 helper 문구를 정렬한다.
- PR merge, finalize, issue close, branch cleanup, deploy/cloud/resource 작업은 계속 사람 명시 승인 뒤에만 진행하도록 경계를 유지한다.

## 범위

- `AGENTS.md`와 Git sync/workflow/collaboration/menu/quality/human-command Source of Truth 문서 수정.
- `scripts/prepare-pr.sh`, `scripts/status-workflow.sh`, `scripts/validate-harness.sh`, `scripts/test-harness.sh`, `scripts/start-workflow.sh`의 정책 문구와 fixture 기대값 정렬.
- 자동 PR 생성 뒤 `Pre-PR Human Checkpoint`가 merge/finalize/cleanup 선택 게이트가 되도록 문구 수정.
- 현재 Phase workspace evidence와 report 작성.

## 범위 제외

- 실제 branch push, PR 생성, PR merge, finalize, issue close, branch cleanup.
- direct `main` push 허용.
- deploy, AWS/cloud resource, migration, external service 실행.
- historical report와 과거 workspace evidence 소급 수정.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/09-collaboration-agreement.md`
- `docs/10-next-action-menu.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/13-human-command-flow.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/18-harness-regression-policy.md`

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
