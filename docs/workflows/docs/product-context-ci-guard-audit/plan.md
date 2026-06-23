# Product context CI guard audit 계획

## 브랜치

- Branch: `docs/product-context-ci-guard-audit`
- Workspace: `docs/workflows/docs/product-context-ci-guard-audit`
- Created: 2026-06-24

## 목표

- MVP v1/current implementation baseline과 Target MVP 문맥이 Source of Truth에서 분리되어 있는지 감사한다.
- 문맥 drift를 CI-safe한 strict validation guard로 잡을 수 있는 최소 앵커를 추가한다.
- 새 guard가 하네스 회귀 테스트로 보호되는지 확인한다.

## 범위

- `README.md`, `docs/01~03`, `docs/05~08`의 product context 앵커 확인.
- `scripts/validate-harness.sh --strict`에 product context guard 추가.
- `scripts/test-harness.sh`에 guard failure fixture 추가.
- Phase report와 workspace evidence 기록.

## 범위 제외

- 기존 M0~M5 report 소급 수정.
- Target MVP 기능 구현.
- PR 생성, push, merge, remote branch 변경.
- 외부 CI 상태나 GitHub PR 상태를 strict validation 안에서 조회.

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
