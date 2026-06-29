# Target dataset scheduling review 계획

## 브랜치

- Branch: `feature/target-dataset-scheduling-review`
- Workspace: `docs/workflows/feature/target-dataset-scheduling-review`
- Created: 2026-06-29

## 목표

- Target Dataset 생성 wizard 후반부에 Scheduling과 Review를 추가한다.
- 데모에서는 "생성 준비"까지 보여주고 실제 실행/저장은 약속하지 않는다.

## 범위

- Target Dataset wizard 단계에 `Scheduling`과 `Review`를 추가한다.
- Scheduling은 기본 `Manual` 또는 `Run manually` 선택을 제공하고, optional schedule placeholder를 보일 수 있다.
- Review는 target dataset name, source, process/output schema, schedule summary를 한 화면에서 확인하게 한다.
- 최종 CTA는 demo-safe wording으로 둔다. 예: `Create target dataset draft`, `생성 준비 완료`.

## 범위 제외

- 실제 backend create/run API 호출.
- run history와 실행 상태 polling.
- cron validation, timezone persistence.
- lineage, permission, approval, rollback.
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

`feature/target-dataset-scheduling-review` branch workspace 범위만 구현한다.
Target Dataset wizard에 `Scheduling`과 `Review` 단계를 추가한다.
Scheduling은 기본 `Manual` 중심으로 제공하고, Review는 target dataset name, source, process/output schema, schedule summary를 확인하게 한다.
최종 CTA는 실제 실행을 암시하지 않는 demo-safe wording으로 둔다.
실제 backend create/run API, run history, polling, cron persistence, lineage, permission은 구현하지 않는다.
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

- [x] Target Dataset wizard에 Scheduling과 Review 단계가 있다.
- [x] Scheduling 기본값이 Manual/수동 실행으로 명확히 보인다.
- [x] Review에서 target dataset, source, process/output schema, schedule이 요약된다.
- [x] 최종 CTA가 실제 실행이 아니라 draft/create preparation에 맞게 표현된다.
- [x] backend create/run, run history, polling은 추가되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
