# Week2 team handoff summary 계획

## 브랜치

- Branch: `docs/week2-team-handoff-summary`
- Workspace: `docs/workflows/docs/week2-team-handoff-summary`
- Created: 2026-06-26

## 목표

- Phase 1~6에서 결정된 Week2 ver2 분업/진행상황을 팀원이 한 번에 읽을 수 있는 handoff summary로 정리한다.
- ver2 README에서 이 summary를 첫 번째 읽는 문서로 연결한다.

## 범위

- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md` 추가
- `docs/project-context/asklake-week2-module-plan/ver2/README.md` 읽는 순서 업데이트
- Phase report와 workspace evidence 작성
- 모듈별 지금 할 일, 보존할 구현, runner boundary, PR #105 처리 기준, 다음 병렬 구현 순서 정리

## 범위 제외

- runtime code/API/schema/contract 변경
- 기존 Phase 1~6 세부 결정 변경
- M2/M3/M5 implementation 시작
- PR merge/finalize/cleanup

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
