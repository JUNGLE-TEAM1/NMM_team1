# PR checkpoint hardening 계획

## 브랜치

- Branch: `docs/pr-checkpoint-hardening`
- Workspace: `docs/workflows/docs/pr-checkpoint-hardening`
- Created: 2026-06-24

## 목표

- 작은 변경의 `PR 진행` 선택이 `Pre-PR Human Checkpoint`를 우회하지 않도록 문서 흐름을 명확히 한다.
- `scripts/start-workflow.sh`의 dirty checkpoint가 `.DS_Store`, 개인 초안, unrelated untracked file을 자동으로 Git 추적에 넣지 않도록 보강한다.

## 범위

- `docs/08`, `docs/09`, `docs/10`, `docs/11`, `docs/13`의 작은 변경 PR/dirty checkpoint 안내를 정렬한다.
- `scripts/start-workflow.sh`의 checkpoint staging을 tracked 변경 중심으로 바꾸고, 제외된 untracked 파일을 보고한다.
- `scripts/test-harness.sh`에 dirty checkpoint 회귀 테스트를 추가한다.
- workspace와 Phase report에 검증 결과를 기록한다.

## 범위 제외

- 이전 PR에서 남은 로컬 개인 초안, `.DS_Store`, 별도 report index 수정은 포함하지 않는다.
- push, PR 생성, merge는 이번 요청의 완료 후 별도 `Pre-PR Human Checkpoint` 선택 전에는 실행하지 않는다.
- GitHub issue 생성 기본 정책 자체는 바꾸지 않는다.

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

- [ ] 작은 변경 PR 흐름이 `Pre-PR Human Checkpoint` 이후 remote action으로 이어진다는 점이 문서상 분명하다.
- [ ] dirty checkpoint가 tracked 변경만 자동 stage하고 untracked/ignored 파일은 보고만 한다.
- [ ] checkpoint hardening 회귀 테스트가 추가되어 통과한다.
- [ ] `scripts/validate-harness.sh --strict`, `scripts/test-harness.sh`, `git diff --check`를 통과한다.
- [ ] Workspace `quality.md`, `sync.md`, `report.md`와 Phase report가 업데이트된다.
