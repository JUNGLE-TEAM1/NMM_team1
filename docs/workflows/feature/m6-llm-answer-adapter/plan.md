# M6 LLM Answer Adapter 계획

## 브랜치

- Branch: `feature/m6-llm-answer-adapter`
- Workspace: `docs/workflows/feature/m6-llm-answer-adapter`
- Created: 2026-06-29

## 목표

- M6 답변 생성 로직을 `LLMAdapter` 경계 뒤로 이동해, 나중에 외부 LLM provider를 붙이더라도 M6가 허용한 SQL rows, CatalogMetadata evidence, retrieval trace만 넘기도록 만든다.

## 범위

- `LLMAnswerContext`, `LLMAnswer`, `LLMHealth` 도메인 모델을 추가한다.
- `LLMAdapter` port와 외부 호출 없는 deterministic `TemplateLLMAdapter`를 추가한다.
- `Week2AIQueryService`가 성공한 SQL/RAG/Hybrid 응답 summary를 adapter로 생성하게 한다.
- blocked/unsupported 응답은 LLM adapter를 호출하지 않고 기존 guardrail summary를 유지한다.
- adapter context에 `SqlEngineContext.local_fallback_path`, raw file, secret, unauthorized column이 들어가지 않도록 regression test를 추가한다.
- `docs/03`, `docs/05`, `docs/06`, `docs/07`에 M6 LLM answer adapter 경계를 반영한다.

## 범위 제외

- 실제 외부 LLM provider 호출, API key/env 설정, provider prompt template.
- 외부 vector DB, real semantic route classifier, Trino/Athena 같은 대형 SQL engine 전환.
- M1 UI 변경. 기존 `AIQueryResult.summary` public field는 유지한다.

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
