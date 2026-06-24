# Project onboarding summary 계획

## 브랜치

- Branch: `docs/project-onboarding-summary`
- Workspace: `docs/workflows/docs/project-onboarding-summary`
- Created: 2026-06-24

## 목표

- 지금까지 AskLake 프로젝트에서 진행한 제품/하네스 정리, current baseline, Target MVP 방향, 병렬 개발 준비 상태를 팀원이 이해하기 쉬운 온보딩 요약 문서로 정리한다.

## 범위

- `docs/reports/project-onboarding-summary.md` 작성.
- 표를 쓰지 않고 문단 중심으로 설명.
- Source of Truth와 최신 report를 바탕으로 현재까지 완료된 것과 아직 방향만 잡힌 것을 구분.
- `docs/reports/README.md` Latest Report Index에 요약 문서 링크 추가.

## 범위 제외

- 제품 요구사항, architecture, interface, workflow Source of Truth 변경.
- 새 기능 또는 코드 구현.
- 원문 기획서의 UX detail을 새 구현 scope로 승격.
- PR/push/merge.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `README.md`
- `docs/01-product-planning.md`
- `docs/02-architecture.md`
- `docs/03-interface-reference.md`
- `docs/17-parallel-milestone-protocol.md`
- `docs/reports/README.md`
- Product Rebaseline, Modular Contract Baseline, Thin Runtime Core, Local Tool Runtime Readiness, Mid-Phase Steering 관련 최신 report

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

- [ ] 온보딩 요약 문서 작성
- [ ] 표 문법이 없는지 확인
- [ ] 핵심 anchor 용어가 필요한 맥락에서 언급되는지 확인
- [ ] 아직 완료되지 않은 기능을 완료된 것처럼 쓰지 않았는지 확인
- [ ] workspace report 업데이트
