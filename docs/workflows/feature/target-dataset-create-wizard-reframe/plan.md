# Target dataset create wizard reframe 계획

## 브랜치

- Branch: `feature/target-dataset-create-wizard-reframe`
- Workspace: `docs/workflows/feature/target-dataset-create-wizard-reframe`
- Created: 2026-06-29

## 목표

- 기존 generic `Source -> Transform -> Target -> Run` 흐름을 `Create Target Dataset` 흐름으로 재구성한다.
- Target Dataset은 source를 기반으로 output dataset과 ETL job definition을 준비하는 시나리오로 표현한다.

## 범위

- Target Dataset wizard 앞부분을 `Overview` -> `Source 선택` -> `Process`로 재구성한다.
- Overview에서 target dataset name, description 또는 목적을 입력한다.
- Source 선택 단계는 기존 source picker, schema preview, source selected toast를 재사용한다.
- Process 단계는 기존 field selection과 output schema preview를 재사용한다.
- 단계 표시는 상단 horizontal stepper를 유지한다.

## 범위 제외

- Scheduling 단계 구현.
- Review 단계 구현.
- 실제 create/run API 호출.
- run history, lineage, permission, backfill.
- Source Dataset wizard 변경.

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

`feature/target-dataset-create-wizard-reframe` branch workspace 범위만 구현한다.
기존 generic `Source -> Transform -> Target -> Run` 흐름을 `Create Target Dataset` wizard 앞부분으로 재구성한다.
단계는 `Overview` -> `Source 선택` -> `Process`로 구성한다.
Overview에는 target dataset name과 간단한 목적/설명을 두고, Source 선택은 기존 picker/schema preview를, Process는 기존 field selection/output schema preview를 재사용한다.
Scheduling, Review, 실제 create/run API, run history, lineage, permission은 구현하지 않는다.
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

- [x] Target Dataset wizard 앞부분이 `Overview` -> `Source 선택` -> `Process`로 보인다.
- [x] target dataset name과 목적/설명 입력이 Overview에 있다.
- [x] 기존 source picker와 schema preview가 Source 선택 단계에서 유지된다.
- [x] field selection과 output schema preview가 Process 단계에서 유지된다.
- [x] Scheduling/Review/API 실행은 추가되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
