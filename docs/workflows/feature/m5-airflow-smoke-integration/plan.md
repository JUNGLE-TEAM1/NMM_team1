# M5 Airflow smoke integration 계획

## 브랜치

- Branch: `feature/m5-airflow-smoke-integration`
- Workspace: `docs/workflows/feature/m5-airflow-smoke-integration`
- Created: 2026-06-26

## 목표

- 추천안 기준으로 로컬 Airflow smoke 연결을 구현한다.
- 완료 기준은 Airflow DAG가 실제 결과 파일을 만들고, backend `Week2AirflowAdapter`가 그 결과를 읽어 `executor=airflow` 실행을 Catalog 저장까지 연결하는 것이다.

## 범위

- 별도 `docker-compose.airflow.yml` 추가
- repo DAG `airflow/dags/asklake_week2_reviews.py` 추가
- Airflow DAG가 shared local volume `data/week2`에 output JSONL과 result JSON artifact를 쓰도록 구현
- `Week2AirflowAdapter`가 DAG success 후 result JSON artifact를 읽도록 구현
- adapter/service 테스트로 fallback 없이 Catalog 저장되는 경로 검증
- Airflow local 실행 문서와 workspace evidence 기록

## 범위 제외

- production Airflow 배포
- MinIO/S3 storage 연결
- SparkRunner/M2 runtime 연결
- full async run status UI
- secret manager 또는 운영 credential 연결

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
