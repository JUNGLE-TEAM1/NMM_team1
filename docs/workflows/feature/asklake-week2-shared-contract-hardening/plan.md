# AskLake week 2 shared contract hardening 계획

## 브랜치

- Branch: `feature/asklake-week2-shared-contract-hardening`
- Workspace: `docs/workflows/feature/asklake-week2-shared-contract-hardening`
- Created: 2026-06-25

## 목표

- M1~M6 모듈 구현 전에 공통으로 맞춰야 할 route, ID, storage path, workflow/run status, `QueryResult`, guardrail failure, daily smoke evidence 계약을 보강한다.
- 각 모듈이 같은 fixture와 Source of Truth를 기준으로 개발을 시작할 수 있게 한다.

## 범위

- `docs/03-interface-reference.md` Week 2 Contract Package 보강
- `contracts/*.sample.json`에 공통 hardening 필드 반영
- acceptance/regression/manual verification에 hardening 확인 기준 추가
- workspace와 durable report 작성
- JSON 유효성, backend tests, strict harness validation 검증

## 범위 제외

- 실제 모듈 구현
- 실제 `SqlEngineAdapter` Python interface 구현
- 실제 DuckDB/Airflow/MinIO/Kafka/PostgreSQL 실행 구현
- UI 구현
- 별도 `contracts/query_result.sample.json` 추가

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/plan.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/project-context/asklake-week2-module-plan/query-result-contract-execution-prompt.md`

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
