# M6 OpenAI LLM Adapter 계획

## 브랜치

- Branch: `feature/m6-openai-llm-adapter`
- Workspace: `docs/workflows/feature/m6-openai-llm-adapter`
- Created: 2026-06-29

## 목표

- M6 `LLMAdapter` 뒤에 OpenAI provider adapter를 env-gated option으로 추가한다.
- 기본값은 기존 deterministic `TemplateLLMAdapter`로 유지해 키가 없어도 Week 2 M6 smoke가 깨지지 않게 한다.
- 외부 LLM에는 M6가 이미 허용한 SQL rows, evidence, retrieval trace만 전달하고, API key, local path, 원본 파일 내용은 보내지 않는다.

## 범위

- `Settings`에 LLM provider/model/base URL/timeout/API key env contract를 추가한다.
- `OpenAILLMAdapter`를 추가하고 Responses API 요청 body를 안전한 answer context에서 만든다.
- `AppContainer`가 `WEEK2_LLM_PROVIDER=openai`와 `OPENAI_API_KEY`가 있을 때만 OpenAI adapter를 선택하게 한다.
- provider 오류, timeout, key 부재 시 기본 template answer로 fallback하는 regression을 추가한다.
- 관련 interface/acceptance/regression/manual verification 문서와 Phase report를 업데이트한다.

## 범위 제외

- 실제 `OPENAI_API_KEY` 생성, 저장, commit, 출력.
- live OpenAI API smoke test. 키는 사용자가 나중에 로컬 환경 변수로 채운다.
- M1 UI 표시 변경, RAG 검색 품질 변경, SQL planner/engine 변경.
- Trino, external vector DB, production cloud resource.

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

- not needed. 이 Phase는 하나의 adapter boundary 변경으로 처리한다.

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

- [x] `OpenAILLMAdapter`가 fake HTTP client test에서 `/responses` 요청을 만들고 `output_text`를 `LLMAnswer(source="external")`로 반환한다.
- [x] request body에 `OPENAI_API_KEY`, dummy key, `local_fallback_path`, `/tmp`, 원본 파일 내용이 들어가지 않는 regression test가 있다.
- [x] provider 오류 또는 key 부재 시 template fallback으로 Week 2 M6 응답이 유지된다.
- [x] 기본 `Settings`와 `AppContainer`는 계속 `TemplateLLMAdapter`를 사용한다.
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
