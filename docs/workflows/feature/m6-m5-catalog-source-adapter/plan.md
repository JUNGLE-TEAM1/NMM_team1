# M6 M5 CatalogSource adapter 계획

## 브랜치

- Branch: `feature/m6-m5-catalog-source-adapter`
- Workspace: `docs/workflows/feature/m6-m5-catalog-source-adapter`
- Created: 2026-06-26

## 목표

- M6 `Week2AIQueryService`가 fixture catalog만 보지 않고 M5 `Week2CatalogStore`에 저장된 최신 `CatalogMetadata`를 `CatalogSource`로 소비하게 한다.
- M5 workflow run 이후 AI Query가 같은 dataset/run/catalog metadata를 evidence source로 사용하도록 연결한다.

## 범위

- `Week2CatalogStore`를 읽는 M5-backed `CatalogSource` adapter를 추가한다.
- app container에서 M5 workflow service와 M6 AI query service가 같은 Week2 catalog store root를 보도록 wiring한다.
- M5 catalog가 비어 있을 때는 기존 fixture fallback을 유지해 기존 fixture-backed smoke를 보존한다.
- workflow run 이후 AI query route가 최신 M5 catalog metadata의 `run_id`, `s3_uri`, `updated_at`을 evidence에 반영하는 regression test를 추가한다.
- 기존 `AIQueryResult`, `CatalogMetadata`, SQL guardrail, fake SQL engine contract는 유지한다.

## 범위 제외

- M5 `Week2CatalogStore` 저장 format 변경.
- `contracts/*.sample.json` 또는 public API schema 변경.
- real DuckDB, Trino, Athena adapter 구현.
- external vector DB, embedding, full document RAG, real LLM provider 연결.
- M1 UI 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/project-context/asklake-week2-module-plan/ver2/existing-implementation-anchor.md`
- `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`
- `docs/workflows/feature/m6-catalog-source-boundary/report.md`
- `docs/workflows/feature/m6-catalog-retrieval-scoring/report.md`

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

- [x] M5-backed `CatalogSource` adapter가 `Week2CatalogStore.load_catalog()` 결과를 반환한다.
- [x] app container에서 M5 workflow service와 M6 AI query service가 같은 Week2 catalog store를 사용한다.
- [x] M5 catalog가 비어 있으면 기존 fixture fallback route가 계속 동작한다.
- [x] workflow run 이후 AI query route가 최신 M5 catalog metadata를 evidence source로 사용한다.
- [x] 기존 fixture-backed API route test와 SQL guardrail regression test가 계속 통과한다.
- [x] 공유 interface/schema 변경이 없다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
