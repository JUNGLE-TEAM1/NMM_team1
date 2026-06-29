# M6 Answer UX Metadata 계획

## 브랜치

- Branch: `feature/m6-answer-ux-metadata`
- Workspace: `docs/workflows/feature/m6-answer-ux-metadata`
- Created: 2026-06-29

## 목표

- M6 `AIQueryResult`에 UI가 바로 해석할 수 있는 `answer_metadata`를 additive field로 추가한다.
- M1 `/query` 화면에서 답변 생성 source/provider/fallback/grounding 상태를 badge와 compact panel로 표시한다.
- 사용자가 "이 답변이 SQL/RAG evidence에 grounded 되었는지, template/OpenAI/fallback 중 무엇인지"를 한눈에 이해하게 한다.

## 범위

- Backend: `LLMAnswer`, `AIQueryResult`, `Week2AIQueryService`에 answer metadata 경계를 추가한다.
- Backend: `TemplateLLMAdapter`와 `OpenAILLMAdapter`가 provider/fallback 정보를 보존하게 한다.
- Frontend: `/query` summary/result area에 `answer_metadata` badge/panel을 추가하고 blocked/unsupported를 성공처럼 보이지 않게 유지한다.
- Contracts/docs: `contracts/ai_query_result.sample.json`, `docs/03`, `docs/05`, `docs/06`, `docs/07`, report/workspace evidence를 업데이트한다.

## 범위 제외

- live `OPENAI_API_KEY` smoke.
- M1 전체 화면 재디자인 또는 navigation 구조 변경.
- RAG scoring/SQL planner/QueryRouter 로직 변경.
- Trino/vector DB/external policy engine 도입.

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

- not needed. Backend metadata와 M1 표시를 하나의 UX handoff Phase로 처리한다.

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

- [x] `AIQueryResult.answer_metadata`가 `source`, `provider`, `fallback_used`, `fallback_reason`, `used_evidence_indexes`, `grounding_state`를 반환한다.
- [x] template 성공, OpenAI 성공, provider fallback, blocked/unsupported 경로의 metadata regression test가 있다.
- [x] `/query` UI가 answer metadata를 compact badge/panel로 표시하고 text overflow 없이 responsive layout을 유지한다.
- [x] 기존 `sql`, `query_result`, `rows`, `summary`, `evidence`, `route`, `retrieval_trace` 소비자는 깨지지 않는다.
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
