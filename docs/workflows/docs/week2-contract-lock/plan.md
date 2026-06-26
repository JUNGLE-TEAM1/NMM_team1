# Week2 contract lock 계획

## 작업 위치

- Branch: `main`
- Workspace: `docs/workflows/docs/week2-contract-lock`
- Created: 2026-06-26
- Note: 사용자가 "계약 결과를 main에 올려주세요"라고 명시해 branch checkout 없이 main에서 직접 반영한다.

## 목표

- Week 2 M1~M6 병렬 구현 전에 공유 입력/반환 계약을 추천안 기준으로 잠근다.
- `contracts/*.sample.json`과 `docs/03`을 같은 기준으로 맞추고, acceptance/regression/manual verification 체크리스트를 갱신한다.

## 범위

- `RuntimeConfig`, `TransformSpec`, `KafkaTopicContract` fixture 추가
- `ExecutionResult.duration_ms` 처리 증거 계약 추가
- `SqlEngineAdapter.explain_schema` 문서 시그니처를 현재 코드의 `SqlEngineContext` 기준으로 정렬
- Source/schema preview route는 fixture-first로 잠그고, 현재 executable route를 명시
- M1 placeholder는 실제 연결 시 shared Week 2 ID로 수렴해야 함을 문서화
- `docs/05`, `docs/06`, `docs/07`의 Week 2 계약 검증 항목 갱신

## 범위 제외

- 실제 M2 SparkRunner, M3 Transform runner, M4 Kafka runtime, M5 runner selection, M6 real SQL/LLM 구현
- Source/schema preview backend endpoint 구현
- MinIO endpoint, fixed/extended sample row count, 실제 replay rate 확정
- PR 생성 또는 branch 전환

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
- `docs/project-context/asklake-week2-module-plan/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`

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
