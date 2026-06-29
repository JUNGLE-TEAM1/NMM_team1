# 협업 하네스 팀 사용 가이드 계획

## 브랜치

- Branch: `docs/collaboration-harness-team-guide`
- Workspace: `docs/workflows/docs/collaboration-harness-team-guide`
- Created: 2026-06-28

## 목표

- 팀원들이 AskLake 협업 하네스의 작업 흐름, 확인 게이트, PR/merge 경계, 문서 기록 방식을 쉽게 이해하고 실제 요청 문장으로 사용할 수 있는 온보딩 학습 문서를 만든다.

## 범위

- `docs/reports/collaboration-harness-team-usage-guide.md` 신규 작성
- `docs/reports/README.md` Latest Report Index에 팀원용 사용 가이드 연결
- branch workspace와 Phase report에 검증 증거 기록

## 범위 제외

- 제품 요구사항, architecture, API/schema/interface 변경
- workflow 규칙 자체 변경
- 코드, runtime, 배포, CI 설정 변경
- 기존 `collaboration-harness-beginner-guide*` 문서 rewrite

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/09-collaboration-agreement.md`
- `docs/10-next-action-menu.md`
- `docs/11-git-sync-policy.md`
- `docs/13-human-command-flow.md`
- `docs/15-context-budget-rule.md`
- 참고 양식: `/Users/tail1/Desktop/krafton-jungle/최종학습_및_정리/doc/주차별 학습/17주차/AskLake/06_AskLake_MVP와_데모전략_학습.md`
- 참고 양식: `/Users/tail1/Desktop/krafton-jungle/최종학습_및_정리/doc/주차별 학습/17주차/study/04-backend-control-security-observability-template.md`

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
