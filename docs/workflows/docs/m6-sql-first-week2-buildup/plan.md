# M6 SQL-first 2주차 빌드업 계획 보강 계획

## 브랜치

- Branch: `docs/m6-sql-first-week2-buildup`
- Workspace: `docs/workflows/docs/m6-sql-first-week2-buildup`
- Created: 2026-06-27

## 목표

- Week2 ver2 문서에 M6의 다음 실행 우선순위가 `SQL MVP 완성`임을 반영한다.
- M6 최종 방향은 RAG/LLM 포함 완성형이지만, 현재 구현은 template SQL/fake SQL 수준이므로 RAG/LLM보다 실제 SQL 기반을 먼저 닫는다는 기준을 남긴다.
- M1~M5 소유권을 침범하지 않도록 M6는 M5 CatalogMetadata를 읽기 전용으로 소비한다는 경계를 명시한다.

## 범위

- `docs/project-context/asklake-week2-module-plan/ver2/`의 팀 공유/대표 path/책임 분리/전환 계획 문서 보강.
- Amazon Reviews 대표 CatalogMetadata의 `storage.local_fallback_path`, `query.table_name`, `query.allowed_columns`, `query.default_limit`을 기준으로 SQL MVP를 정의.
- RAG/LLM은 SQL MVP 이후 빌드업 단계로 표현.
- 문서-only Phase report와 workspace evidence 작성.

## 범위 제외

- backend/frontend code 수정.
- `AIQueryResult` schema 또는 `contracts/*.sample.json` 변경.
- 외부 LLM provider, external vector DB, full document RAG 구현.
- 범용 NL2SQL 구현.
- M1~M5 소유 영역 구현 또는 책임 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/project-context/asklake-week2-module-plan/ver2/implementation-transition-plan.md`
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
