# M1 query route trace UI 계획

## 브랜치

- Branch: `feature/m1-query-route-trace-ui`
- Workspace: `docs/workflows/feature/m1-query-route-trace-ui`
- Created: 2026-06-28

## 목표

- M6 `AIQueryResult.route`와 `retrieval_trace`를 M1 `/query` 화면에서 방어적으로 표시한다.
- SQL-first route와 unsupported/blocked route를 발표자가 구분할 수 있게 한다.

## 범위

- `/query` 화면에 `route` 표시를 추가한다.
- `retrieval_trace[]`의 source id, score, matched terms, evidence index를 compact하게 표시한다.
- 기존 `sql`, `query_result`, `rows`, `summary`, `evidence` 표시는 유지한다.
- field가 없거나 비어 있어도 화면이 깨지지 않도록 null/empty guard를 둔다.
- unsupported/blocked 질문은 성공 결과처럼 보이지 않게 별도 상태로 표시한다.

## 범위 제외

- M6 route enum 또는 backend 응답 계약 변경
- SQL planner, retrieval scoring, evidence generation 로직 변경
- RAG/hybrid/LLM route 구현
- query result chart 대규모 개편

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
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

- [ ] `/query` 화면이 `route=sql`을 표시한다.
- [ ] `/query` 화면이 `route=unsupported` 또는 blocked 상태를 성공처럼 표시하지 않는다.
- [ ] `retrieval_trace[]`가 있으면 source/score/matched terms/evidence index가 보인다.
- [ ] `retrieval_trace[]`가 없어도 화면이 깨지지 않는다.
- [ ] `cd frontend && npm run build` 통과
- [ ] route/trace keyword scan 통과
- [ ] `scripts/validate-harness.sh --strict` 통과
- [ ] `quality.md`와 `report.md` 업데이트
