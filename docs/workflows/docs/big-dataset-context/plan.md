# Big dataset manipulation context alignment 계획

## 브랜치

- Branch: `codex/big-dataset-context`
- Workspace: `docs/workflows/docs/big-dataset-context`
- Created: 2026-06-25

## 목표

- AskLake가 대용량/복합 데이터셋을 수집·스키마화·변환·검산·게시하는 플랫폼이라는 제품 문맥을 Source of Truth에 명확히 보강한다.
- 기존 B2B SaaS, local/container Target MVP, production-grade 운영 제외 범위는 유지한다.

## 범위

- `README.md`의 제품 설명과 Target MVP 흐름 보강.
- `docs/01-product-planning.md`의 문제 정의, Target MVP 범위, 제외 범위, 성공 기준 보강.
- `docs/02-architecture.md`의 Data Plane 책임과 Trusted Dataset 게시 흐름 보강.
- `docs/03-interface-reference.md`의 기존 처리 증거 필드 의미 설명 보강.
- `docs/05`, `docs/06`, `docs/07`, `docs/08`의 acceptance/regression/manual/workflow 문맥 보강.

## 범위 제외

- runtime code, schema migration, API 구현.
- production-grade distributed processing, cloud resource, deploy.
- Spark/Flink/Trino/Athena 강제 도입.

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
