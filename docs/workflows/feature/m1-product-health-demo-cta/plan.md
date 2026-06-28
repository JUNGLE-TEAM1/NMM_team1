# M1 product health demo CTA 계획

## 브랜치

- Branch: `feature/m1-product-health-demo-cta`
- Workspace: `docs/workflows/feature/m1-product-health-demo-cta`
- Created: 2026-06-28

## 목표

- M6 SQL planner intent에 맞춘 Product Health 데모 질문 CTA를 M1 `/query` 화면에 추가한다.
- 발표자가 지원 질문과 미지원 질문의 차이를 빠르게 보여줄 수 있게 한다.

## 범위

- `/query` 화면의 demo question 후보를 Product Health 중심으로 정리한다.
- `top_risk`, `top_negative_review`, `low_conversion`, `top_late_delivery`에 대응하는 한국어 질문 버튼을 추가한다.
- 클릭 시 기존 query input/action 흐름을 재사용한다.
- Product Health Gold가 준비되지 않은 경우 readiness 안내와 함께 query가 blocked될 수 있음을 표시한다.
- 기존 Amazon Reviews 질문 후보가 필요하면 legacy/supporting path로 구분한다.

## 범위 제외

- M6 intent rule 변경
- SQL planner/backend query 변경
- Product Health metric 정의 변경
- M3/M5 sample data 생성
- 대규모 UI navigation 재설계

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/reports/m6-sql-planner-intents.md`
- `docs/reports/m6-response-contract-trace.md`
- `docs/reports/week2-product-risk-source-of-truth-propagation.md`
- `docs/reports/m1-ai-query-live-ui.md`

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

- [x] Product Health demo question CTA가 `/query` 화면에 표시된다.
- [x] CTA 클릭이 기존 query 실행 흐름을 재사용한다.
- [x] 미지원 질문 예시는 unsupported/blocked 표시를 확인할 수 있게 분리된다.
- [x] 기존 query/evidence 표시가 깨지지 않는다.
- [x] `cd frontend && npm run build` 통과
- [x] CTA keyword scan 통과
- [x] `scripts/validate-harness.sh --strict` 통과
- [x] `quality.md`와 `report.md` 업데이트
