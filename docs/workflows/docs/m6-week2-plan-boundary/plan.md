# M6 Week2 plan boundary update 계획

## 브랜치

- Branch: `docs/m6-week2-plan-boundary`
- Workspace: `docs/workflows/docs/m6-week2-plan-boundary`
- Created: 2026-06-27

## 목표

- M6의 SQL-first 후속 빌드업 계획을 Week2 문서에 반영한다.
- M1~M5 소유권과 충돌하지 않도록 M6의 read-only Catalog 소비, adapter 기반 SQL 실행, additive 응답 계약, RAG/LLM 후속 경계를 명시한다.

## 범위

- `docs/project-context/asklake-week2-module-plan/ver2/README.md`의 M6 요약 guardrail 보강
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`의 M6 책임/비책임/세부 개발 분할 보강
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`의 M6 SQL-first 기준과 후속 slice 분할 보강
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`의 팀 handoff용 M6 내부 구현 순서 보강
- `docs/03-interface-reference.md`의 SQL context, missing path blocked, additive `route`/`retrieval_trace` 후속 계약 조건 보강

## 범위 제외

- 구현 코드 변경
- `contracts/*.sample.json` schema 변경
- 외부 LLM provider/API key 설정
- M1 UI, M2 runtime, M3 ETL, M4 Kafka, M5 Catalog 저장/API 구현 변경
- PR 생성/merge/finalize/cleanup

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
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
