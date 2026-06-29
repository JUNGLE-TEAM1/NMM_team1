# Harness neutral decision guidance 계획

## 브랜치

- Branch: `docs/harness-neutral-decision-guidance`
- Workspace: `docs/workflows/docs/harness-neutral-decision-guidance`
- Created: 2026-06-29

## 목표

- 팀원이 원하는 결론을 AI에게 받아와서 "하네스가 이렇게 말했다"로 사용하는 문제를 줄이기 위해, 하네스 관련 판단 질문에 대한 AI의 중립적 답변 기준을 사용 가이드에 보강한다.
- AI가 장점, 리스크, 보완책, 반대 관점, 추천도, 신뢰도, 사람 확인 지점을 함께 제시하도록 안내한다.
- 협업에서 감정과 불안도 실제 신호로 다루되, 다른 팀원의 시간과 책임을 흔들 수 있는 제안은 제안자가 직접 설명해야 함을 명확히 한다.

## 범위

- `docs/reports/collaboration-harness-team-usage-guide.md`의 사람/AI 책임 섹션에 AI 답변 중립성 원칙을 추가한다.
- FAQ와 체크리스트에 편향된 AI 답변을 팀 근거로 쓰지 않는 기준과 좋은 요청 예시를 추가한다.
- Phase report와 workspace evidence를 갱신한다.

## 범위 제외

- 하네스의 Source of Truth 규칙 자체 변경
- runtime code, CI, script, GitHub guardrail 변경
- PR merge/finalize 자동화 규칙 변경
- 실제 MVP 범위 또는 데모 시나리오 변경

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

- [ ] 사용 가이드에 AI 답변 중립성, 추천도, 반대 관점, 제안자 책임, 협업 비용 기준이 반영됐다.
- [ ] FAQ와 체크리스트에서 팀원이 실제로 사용할 질문 예시를 확인할 수 있다.
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
