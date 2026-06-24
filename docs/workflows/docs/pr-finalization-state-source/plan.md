# PR finalization state source 계획

## 브랜치

- Branch: `docs/pr-finalization-state-source`
- Workspace: `docs/workflows/docs/pr-finalization-state-source`
- Created: 2026-06-24

## 목표

- PR merge 이후 `sync.md` final field가 main에 반영되지 못해 stale 상태로 남아도 하네스가 작업을 active로 오판하지 않게 한다.
- `status-workflow`와 `list-active-branches`가 가능한 경우 GitHub PR/issue 상태를 기준으로 merged/closed 여부를 판단하도록 보강한다.

## 범위

- `scripts/status-workflow.sh`에 PR link 기반 GitHub PR/issue 상태 조회와 stale warning을 추가한다.
- `scripts/list-active-branches.sh`에 GitHub PR/issue 상태 기반 branch 분류를 추가한다.
- `scripts/test-harness.sh`에 stale `sync.md` open 값이 GitHub merged/closed 상태로 보정되는 fixture를 추가한다.
- 관련 Source of Truth 문서와 report/workspace evidence를 업데이트한다.

## 범위 제외

- 과거 workspace의 `sync.md` final field를 소급 수정하지 않는다.
- PR merge 후 별도 follow-up PR을 자동 생성하는 흐름은 만들지 않는다.
- GitHub 조회가 불가능한 환경에서 remote 상태를 강제하지 않는다.

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

- [ ] `sync.md`가 `open`이어도 GitHub가 `MERGED`/`CLOSED`이면 상태 스크립트가 merged/closed로 해석한다.
- [ ] `list-active-branches.sh`가 stale `sync.md` 때문에 이미 merge된 branch를 active PR 후보로 권장하지 않는다.
- [ ] `scripts/test-harness.sh` fixture가 stale finalization 상태를 보호한다.
- [ ] `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/test-harness.sh`, `git diff --check`가 통과한다.
- [ ] Phase report와 workspace evidence가 업데이트된다.
