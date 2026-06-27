# M6 SQL execution context 계획

## 브랜치

- Branch: `feature/m6-sql-context`
- Workspace: `docs/workflows/feature/m6-sql-context`
- Created: 2026-06-27

## 목표

- 새 M6 10단계 빌드업의 1단계인 `SQL execution context 보강`을 구현한다.
- M5 `CatalogMetadata.storage.local_fallback_path`를 M6 `SqlEngineContext`에 전달하고, path가 없는 Catalog는 SQL 성공처럼 처리하지 않고 `blocked`로 반환한다.

## 범위

- `SqlEngineContext`에 optional `local_fallback_path`를 추가한다.
- `Week2AIQueryService._context_from_catalog()`가 `CatalogMetadata.storage.local_fallback_path`를 읽어 SQL context에 넣는다.
- 현재 fake SQL adapter가 유효한 SQL이라도 `local_fallback_path`가 없으면 `local_path_missing` guardrail로 차단한다.
- M6 focused tests에 path 전달, missing path blocked, fake SQL adapter guardrail을 추가한다.

## 범위 제외

- DuckDB adapter 구현
- 실제 파일 존재 여부/readability 검증
- SQL Planner 분리
- `route`, `retrieval_trace` 응답 계약 추가
- Catalog RAG-lite, Hybrid query, external LLM
- M5 Catalog 저장/API, M2 runtime, M1 UI 변경

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`

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
