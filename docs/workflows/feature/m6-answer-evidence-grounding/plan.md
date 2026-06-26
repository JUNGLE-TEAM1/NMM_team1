# M6 answer evidence grounding 계획

## 브랜치

- Branch: `feature/m6-answer-evidence-grounding`
- Workspace: `docs/workflows/feature/m6-answer-evidence-grounding`
- Created: 2026-06-26

## 목표

- M6 `AIQueryResult`가 M5 `CatalogMetadata`의 schema, metric, lineage 근거를 함께 반환하도록 보강한다.
- M5 run 이후 M6 query까지 이어지는 발표용 E2E 경로에서 `summary`, `evidence`, `query_result`가 같은 catalog/run 근거를 가리키는지 검증한다.

## 범위

- `QueryEvidence`에 M1이 표시할 수 있는 optional grounding fields를 추가한다.
- `Week2AIQueryService`가 선택한 CatalogMetadata에서 schema fields, metrics, lineage, retrieval terms를 evidence와 summary에 반영한다.
- `contracts/ai_query_result.sample.json`과 `docs/03-interface-reference.md`의 Week 2 `AIQueryResult` 설명을 갱신한다.
- focused M6 테스트와 backend regression 테스트로 기존 fixture/fake SQL 경로를 보호한다.

## 범위 제외

- real LLM provider, external vector DB, full document RAG 연결
- real DuckDB/Trino/Athena SQL engine 구현
- M1 UI 표시 구현
- M3 schema/profile facts 생성 로직 변경
- M5 Catalog 저장소/API 소유 범위 변경

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/reports/m6-m5-catalog-source-adapter.md`

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
