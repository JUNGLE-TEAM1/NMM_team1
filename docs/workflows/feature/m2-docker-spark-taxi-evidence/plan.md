# M2 Docker Spark Taxi evidence 계획

## 브랜치

- Branch: `feature/m2-docker-spark-taxi-evidence`
- Workspace: `docs/workflows/feature/m2-docker-spark-taxi-evidence`
- Created: 2026-06-29

## 목표

- 공개 Spark image를 사용해 Docker 안에서 Spark driver/master/worker 실행 경로를 검증한다.
- 작은 Taxi Parquet 파일을 먼저 처리하고, 같은 경로로 5GB급 Taxi Parquet directory를 처리한다.
- 기존 M2 Taxi evidence result shape에 맞춰 input rows/bytes, duration, output path, output rows/bytes를 남긴다.

## 범위

- `apache/spark:4.0.1` 기반 Docker Compose를 추가한다.
- Spark master 1개, worker 2개, driver 1개 구조로 실행한다.
- host input mount는 `/Users/liamtsy/Desktop/asklake_taxi_data copy` -> container `/data/taxi`로 둔다.
- repo output은 host `data/results/...` -> container `/app/data/results/...`로 둔다.
- 작은 Taxi 파일 smoke와 5GB Taxi directory smoke를 실행한다.
- Docker cluster 실행에서 필요한 runner network/hostname 보정을 한다.

## 범위 제외

- Airflow DAG 내부 Spark 호출은 이번 범위가 아니다.
- Product Health 5GB 대표 경로 실행은 이번 범위가 아니다.
- 커스텀 Spark image build는 이번 범위가 아니다.
- MinIO/S3 durable write는 이번 범위가 아니다.
- GitHub 이슈/PR 생성은 인증 문제로 자동 완료하지 못하면 sync 문서에 보류 사유를 기록한다.

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
