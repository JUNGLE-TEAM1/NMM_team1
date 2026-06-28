# M1 demo readiness panel 계획

## 브랜치

- Branch: `feature/m1-demo-readiness-panel`
- Workspace: `docs/workflows/feature/m1-demo-readiness-panel`
- Created: 2026-06-28

## 목표

- M1 화면에 발표용 readiness panel을 추가해 M2/M3/M5/M6/M1 준비 상태를 한눈에 보여준다.
- 아직 준비되지 않은 항목은 성공처럼 숨기지 않고 모듈별 다음 행동으로 연결한다.

## 범위

- `/etl`, `/catalog`, `/query` 중 가장 자연스러운 위치에 compact readiness panel을 추가한다.
- M2 runtime evidence, M3 Gold semantics, M5 Catalog lineage, M6 SQL/evidence, M1 browser smoke 상태를 표시한다.
- 각 항목은 `ready`, `blocked`, `not-ready`, `unknown` 같은 UI 상태로 표현한다.
- 실제 상태를 알 수 없는 항목은 unknown으로 표시하고, 임의 성공 값을 넣지 않는다.
- 기존 M1 화면의 카드/배지 패턴을 재사용한다.

## 범위 제외

- 새로운 backend health/readiness API 생성
- M2/M3/M5/M6 내부 상태 계산 로직 구현
- GitHub PR 상태를 실시간으로 화면에 표시
- 배포/운영 dashboard 구현
- 대규모 layout rewrite

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/reports/m2-product-health-runtime-smoke.md`
- `docs/reports/m3-v2.1.1-contract-implementation-pr-report.md`
- `docs/reports/m5-airflow-smoke-integration.md`
- `docs/reports/m6-response-contract-trace.md`
- `docs/reports/m1-week2-final-demo-flow.md`

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

- [x] readiness panel이 M2/M3/M5/M6/M1 상태를 표시한다.
- [x] 확인 불가능한 상태는 `unknown` 또는 `not-ready`로 표시한다.
- [x] Gold output/Catalog/query evidence 미준비가 fake success로 보이지 않는다.
- [x] 기존 `/etl`, `/catalog`, `/query` layout이 깨지지 않는다.
- [x] `cd frontend && npm run build` 통과
- [x] readiness panel keyword scan 통과
- [x] `scripts/validate-harness.sh --strict` 통과
- [x] `quality.md`와 `report.md` 업데이트
