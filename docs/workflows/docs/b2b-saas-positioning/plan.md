# B2B SaaS positioning alignment 계획

## 브랜치

- Branch: `codex/b2b-saas-positioning`
- Workspace: `docs/workflows/docs/b2b-saas-positioning`
- Created: 2026-06-25

## 목표

- README와 직접 연결된 Source of Truth에서 AskLake 제품 방향을 `B2B SaaS`로 정렬한다.
- Target MVP는 `local/container` 환경의 단일 Demo Tenant 검증이라는 실행 범위를 유지한다.

## 범위

- `README.md` 제품 한 줄 설명과 Target MVP 실행 환경 문맥 수정.
- `docs/01-product-planning.md`의 제품 한 줄 설명, Deployment, 제외 범위, R7 packaging 문구 정렬.
- `docs/02-architecture.md`의 Kubernetes/Helm packaging 목적 문구 정렬.
- `docs/08-development-workflow.md`의 R7 planning alias 문구 정렬.

## 범위 제외

- runtime code 변경.
- cloud resource 생성, deploy, push, PR, merge.
- production-grade multi-tenant SaaS 운영 구현 범위 추가.

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
