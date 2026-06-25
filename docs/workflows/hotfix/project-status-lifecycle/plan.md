# Project status lifecycle 계획

## 브랜치

- Branch: `hotfix/project-status-lifecycle`
- Workspace: `docs/workflows/hotfix/project-status-lifecycle`
- Created: 2026-06-25

## 목표

- linked issue / GitHub Project lifecycle을 `branch start -> In Progress`, `PR open -> Review`, `PR merge/finalize -> issue closed + Done`으로 하네스에 반영한다.
- lifecycle의 상세 Source of Truth는 `docs/11-git-sync-policy.md`에 두고, 다른 workflow 문서는 얇은 참조만 유지한다.
- PR open 상태에서 linked issue가 이미 closed인 mismatch를 `scripts/status-workflow.sh`가 감지하도록 한다.

## 범위

- `scripts/prepare-pr.sh` PR 생성/감지 경로에서 linked issue Project Status를 `Review`로 설정한다.
- `scripts/status-workflow.sh`가 open PR + closed issue mismatch를 별도 신호와 추천 행동으로 표시한다.
- `scripts/test-harness.sh`에 branch start `In Progress`, PR open `Review`, finalize `Done`, mismatch guard 회귀 테스트를 유지/추가한다.
- `docs/11-git-sync-policy.md`, `docs/04-development-guide.md`, `docs/08-development-workflow.md`, `docs/10-next-action-menu.md`를 최소 수정한다.

## 범위 제외

- PR merge, issue close, branch cleanup 같은 원격 상태 변경 실행.
- 과거 issue/Project bulk reconciliation 재실행.
- GitHub Project field schema 변경.

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
