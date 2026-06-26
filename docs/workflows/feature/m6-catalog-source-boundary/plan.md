# M6 CatalogSource 경계 계획

## 브랜치

- Branch: `feature/m6-catalog-source-boundary`
- Workspace: `docs/workflows/feature/m6-catalog-source-boundary`
- Created: 2026-06-26

## 목표

- M6 `Week2AIQueryService`가 fixture JSON 파일을 직접 읽는 구조를 `CatalogSource` 경계 뒤로 분리한다.
- 기존 `POST /api/week2/ai/query` 응답 계약과 fake `SqlEngineAdapter` smoke를 유지하면서, 후속 M5 Catalog store/API source로 전환 가능한 구조를 만든다.

## 범위

- `CatalogSource` protocol과 fixture 기반 구현을 추가한다.
- `Week2AIQueryService`가 `CatalogSource`를 주입받아 `CatalogMetadata`를 조회하도록 바꾼다.
- 테스트에서 in-memory catalog source를 주입해 fixture 파일 의존 없이 CatalogMetadata 기반 selected dataset/evidence가 만들어지는지 검증한다.
- 기존 M6 route, `AIQueryResult`, `QueryResult`, SQL guardrail, fake SQL engine 동작은 유지한다.

## 범위 제외

- M5 Catalog store/API 구현.
- M3 JSON profile/schema/TransformSpec 구현.
- real DuckDB, Trino, Athena adapter 구현.
- 외부 vector DB, full document RAG, embedding, real LLM provider 연결.
- `docs/03-interface-reference.md` 또는 `contracts/*.sample.json` 계약 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/03-interface-reference.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/reports/week2-m6-rag-scope.md`
- `docs/reports/week2-contract-lock.md`
- `contracts/catalog_metadata.sample.json`
- `contracts/ai_query_result.sample.json`
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

- [x] `Week2AIQueryService`가 file path 대신 `CatalogSource` 경계로 catalog를 조회한다.
- [x] 기본 앱 route는 기존 fixture catalog source로 계속 동작한다.
- [x] 테스트에서 in-memory catalog source를 주입해 `selected_datasets`, `evidence`, `query_result`가 source metadata 기반임을 확인한다.
- [x] `AIQueryResult.query_result.sql`과 top-level `sql` mirror가 유지된다.
- [x] 기존 SQL guardrail 테스트가 통과한다.
- [x] M6 코드가 DuckDB, Trino, Athena, external LLM, vector DB를 직접 import하지 않는다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
