# AskLake week 2 contract setup 계획

## 브랜치

- Branch: `feature/asklake-week2-contract-setup`
- Workspace: `docs/workflows/feature/asklake-week2-contract-setup`
- Created: 2026-06-25

## 목표

- AskLake 2주차 M1~M6 구현 전에 공유할 fixture contract package를 만든다.
- producer/consumer 경계, Airflow/local runner 호환 결과 형식, `SqlEngineAdapter` 경계를 구현 전 합의 가능한 수준으로 고정한다.
- 불확실한 sample path, row count, MinIO layout은 임의 확정하지 않고 TODO/decision으로 남긴다.

## 범위

- `contracts/*.sample.json` 6개 추가
- `docs/03-interface-reference.md`에 AskLake Week 2 Contract Package 섹션 추가
- acceptance, regression, manual verification에 fixture contract 확인 기준 최소 반영
- branch workspace와 Phase report 작성
- JSON fixture 유효성, backend tests, strict harness validation 검증

## 범위 제외

- 실제 Airflow DAG 구현
- 실제 DuckDB 실행 구현
- RAG/AI Query 구현
- UI 구현
- Taxi/Kafka 실제 ingestion 구현
- Trino/Athena/AWS S3 전환
- 로그인/RBAC
- production 배포

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/README.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/project-context/asklake-week2-module-plan/plan.md`
- `docs/project-context/asklake-week2-module-plan/contract-setup-prompt.md`

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
