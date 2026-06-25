# Remote reconciliation auto PR 계획

## 브랜치

- Branch: `hotfix/remote-reconciliation-auto-pr`
- Workspace: `docs/workflows/hotfix/remote-reconciliation-auto-pr`
- Created: 2026-06-25

## 목표

- GitHub Issue / Project / PR 같은 원격 운영 상태를 직접 수정하고, 그 수정이 하네스 스크립트/문서/검증 규칙으로 재현 가능하게 반영된 경우 자동 PR 생성 대상임을 명문화한다.
- `scripts/status-workflow.sh`가 해당 evidence를 가진 PR-ready workspace를 구체적인 자동 PR 후보로 추천하게 한다.

## 범위

- `docs/08-development-workflow.md`, `docs/10-next-action-menu.md`, `docs/11-git-sync-policy.md`, `docs/04-development-guide.md` 정책 보강.
- `scripts/status-workflow.sh` remote operations reconciliation evidence 감지와 추천 문구 보강.
- `scripts/test-harness.sh` regression test 추가.
- workspace/report/quality evidence 작성.

## 범위 제외

- PR merge 자동화 확대.
- deploy/cloud/resource 생성 또는 삭제 자동화 확대.
- 사용자의 `PR 올리지 마`, `로컬에만 둬`, `보류`, `PR은 나중에`, `draft만` opt-out 규칙 변경.
- 모든 원격 조작을 무조건 PR 대상으로 만드는 정책.

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
