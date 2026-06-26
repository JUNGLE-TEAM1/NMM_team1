# M1 AI Query Live UI 계획

## 브랜치

- Branch: `feature/m1-ai-query-live-ui`
- Workspace: `docs/workflows/feature/m1-ai-query-live-ui`
- Created: 2026-06-26

## 목표

- `/query`(`/ask`) 화면에서 M6 `POST /api/week2/ai/query` 응답을 실제로 호출하고 `AIQueryResult`를 표시한다.

## 범위

- 질문 입력 후 `askWeek2AiQuery(question)` 호출.
- `AIQueryResult.status`, `guardrail.validation_status`, `summary`, `sql`, `chart_spec` 표시.
- `AIQueryResult.query_result`를 canonical SQL 실행 결과로 사용해 columns/rows/row_count/duration/executed_at 표시.
- `AIQueryResult.evidence[]`의 optional grounding fields를 방어적으로 표시.
- 빈 질문, API error, loading 상태 표시.

## 범위 제외

- M6 retrieval/scoring, SQL planning, SQL guardrail 구현.
- M1에서 SQL, summary, evidence를 직접 생성하는 동작.
- chart library 도입 또는 dashboard 구현.
- external vector DB, full document RAG, real LLM provider 연결.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`
- `docs/03-interface-reference.md`
- `contracts/ai_query_result.sample.json`

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
