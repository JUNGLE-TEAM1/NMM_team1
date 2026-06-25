# Week2 main E2E path 계획

## 브랜치

- Branch: `docs/week2-main-e2e-path`
- Workspace: `docs/workflows/docs/week2-main-e2e-path`
- Created: 2026-06-25

## 목표

- Week2 발표와 병렬 구현의 기준이 되는 main E2E path를 하나로 확정한다.
- Amazon Reviews JSON -> M3 profile/schema/transform spec -> M5 Workflow/Catalog -> M6 AI Query -> M1 UI 흐름을 발표 필수 경로로 고정한다.

## 범위

- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md` 작성
- `docs/project-context/asklake-week2-module-plan/ver2/README.md` 읽는 순서와 현재 기준 업데이트
- workspace evidence와 `docs/reports/week2-main-e2e-path.md` 작성
- Taxi/Kafka/SparkRunner가 main path 선행 조건이 아님을 명시

## 범위 제외

- runtime code, API/schema, contract sample 변경
- Taxi full ETL 구현
- Kafka streaming to Gold 구현
- SparkRunner 구현 또는 Spark 실행 필수화
- M3 JSON profile/schema/transform spec 상세 구현

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
