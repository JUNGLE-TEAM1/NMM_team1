# M2 Airflow SparkRunner handoff 계획

## 브랜치

- Branch: `feature/m2-airflow-sparkrunner-handoff`
- Workspace: `docs/workflows/feature/m2-airflow-sparkrunner-handoff`
- Created: 2026-06-29

## 목표

- M5 Airflow DAG task가 M2 `Week2SparkRunner`를 직접 호출하지 않고도, CLI로 runner를 실행하고 M5가 읽는 shared result artifact를 받을 수 있게 한다.
- artifact는 기존 `Week2AirflowAdapter`가 소비하는 `week2_result` wrapper와 `Week2RunnerResult` 호환 필드를 그대로 사용한다.

## 범위

- `scripts/week2_m2_airflow_sparkrunner_handoff.py` 추가
- `contracts/runtime_config.sample.json`에 Airflow handoff용 runtime profile 추가
- M5 adapter가 artifact를 읽을 수 있음을 보장하는 focused test 추가
- `docs/03-interface-reference.md`, `docs/07-manual-verification-playbook.md`에 CLI/검증 경로 기록

## 범위 제외

- Airflow service, scheduler, webserver, DAG ownership 구현
- M5 Catalog persistence 로직 변경
- Product Health 5GB 실행
- Spark direct `s3a://` write
- real AWS S3/IAM 검증

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/03-interface-reference.md`
- `docs/07-manual-verification-playbook.md`
- `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m5-airflow-integration-options.md`

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
