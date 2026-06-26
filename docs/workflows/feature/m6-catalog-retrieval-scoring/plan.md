# M6 Catalog retrieval scoring 계획

## 브랜치

- Branch: `feature/m6-catalog-retrieval-scoring`
- Workspace: `docs/workflows/feature/m6-catalog-retrieval-scoring`
- Created: 2026-06-26

## 목표

- M6 `Week2AIQueryService` 안에 흩어진 catalog 선택 규칙을 `CatalogRetriever` 경계로 분리한다.
- 여러 `CatalogMetadata` 후보가 있을 때 질문과 catalog metadata를 점수화해 더 알맞은 dataset을 선택하고, 선택 근거를 `selected_datasets.reason`에 반영한다.

## 범위

- `CatalogRetriever` 또는 동등한 내부 service를 추가한다.
- catalog의 `name`, `dataset_id`, `schema.fields`, `query.allowed_columns`를 기반으로 질문-카탈로그 매칭 점수를 계산한다.
- `Week2AIQueryService`가 직접 `max(... matched terms ...)`를 수행하지 않고 retriever 결과를 사용하도록 바꾼다.
- 여러 catalog를 넣은 테스트에서 질문별로 다른 dataset이 선택되는지 확인한다.
- 기존 `AIQueryResult`, `QueryResult`, route response, fake SQL engine guardrail 동작은 유지한다.

## 범위 제외

- M5 실제 Catalog store/API adapter 연결.
- external vector DB, embedding, full document RAG, real LLM provider 연결.
- real DuckDB, Trino, Athena adapter 구현.
- `AIQueryResult` 또는 `CatalogMetadata` sample contract 변경.
- M1 UI 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/implementation-transition-plan.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/workflows/feature/m6-catalog-source-boundary/report.md`

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

- [x] catalog 선택 점수화 로직이 `Week2AIQueryService`에서 분리되어 있다.
- [x] 여러 catalog 후보 중 질문에 맞는 dataset을 선택하는 테스트가 있다.
- [x] `selected_datasets.reason`이 선택 근거 용어를 포함한다.
- [x] 기존 fixture-backed API route test가 계속 통과한다.
- [x] SQL mirror와 guardrail regression test가 계속 통과한다.
- [x] 공유 interface/schema 변경이 없다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
