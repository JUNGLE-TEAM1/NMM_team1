# Main backup tag script 계획

## 브랜치

- Branch: `docs/main-backup-tag-script`
- Workspace: `docs/workflows/docs/main-backup-tag-script`
- Created: 2026-06-26

## 목표

- 사용자가 "오늘 백업 만들어줘"라고 요청했을 때 누구나 같은 방식으로 `origin/main` 기준 backup tag를 만들 수 있는 공용 스크립트를 추가한다.
- 기존 project-context 프롬프트는 하네스 Source of Truth 정책이 아니라 스크립트 사용 안내로 유지한다.

## 범위

- `scripts/create-main-backup-tag.sh` 추가
- `docs/project-context/ad-hoc-main-backup-tag-prompt.md`를 스크립트 우선 사용으로 보강
- branch workspace evidence 작성
- dry-run 기반 검증

## 범위 제외

- 실제 backup tag 생성
- `main`, `dev`, `master` 브랜치 전략 변경
- 하네스 Source of Truth 정책 변경
- PR #120/#121 내용 재수정

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

- [x] `origin/main` commit을 기준으로 tag target을 잡는다.
- [x] `backup/main-YYYY-MM-DD` 중복 시 `-1`, `-2` suffix를 선택한다.
- [x] `--dry-run`으로 실제 tag/push 없이 검증할 수 있다.
- [x] project-context 프롬프트가 스크립트 사용을 안내한다.
- [x] 검증 결과를 `quality.md`와 `report.md`에 기록한다.
