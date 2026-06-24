# Small change PR decision 계획

## 브랜치

- Branch: `docs/small-change-pr-decision`
- Workspace: `docs/workflows/docs/small-change-pr-decision`
- Created: 2026-06-24

## 목표

- 작은 변경 완료 후 PR을 열지, 로컬에 보류할지, 더 큰 branch에 흡수할지 판단하는 하네스 규칙을 추가한다.
- PR 전 포함 파일과 제외 파일을 분리하고 `.DS_Store`, 개인 초안, unrelated untracked file이 섞이지 않게 한다.

## 범위

- `docs/09-collaboration-agreement.md`에 `Small Change PR Agreement` 추가.
- `docs/10-next-action-menu.md`에 `Small Change Completion Decision` 메뉴 추가.
- `docs/13-human-command-flow.md`에 작은 변경 PR 판단 명령 예시와 AI 책임 추가.
- `docs/08-development-workflow.md`에 작은 변경 완료와 PR 전 파일 분리 규칙 연결.
- `docs/reports/small-change-pr-decision.md` report 작성.
- `docs/reports/README.md` report index 추가.

## 범위 제외

- 제품 기능 또는 runtime code 변경.
- `scripts/start-workflow.sh` 동작 수정.
- 개인 초안 파일이나 `.DS_Store`를 PR scope에 포함.
- PR/push/merge.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/09-collaboration-agreement.md`
- `docs/10-next-action-menu.md`
- `docs/13-human-command-flow.md`

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

- [ ] 범위 완료
- [ ] TDD 상태 기록
- [ ] harness validation 통과
- [ ] test-harness 실행 또는 skip reason 기록
- [ ] report 업데이트
