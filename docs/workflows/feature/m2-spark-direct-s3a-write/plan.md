# M2 Spark direct s3a write smoke 계획

## 브랜치

- Branch: `feature/m2-spark-direct-s3a-write`
- Workspace: `docs/workflows/feature/m2-spark-direct-s3a-write`
- Created: 2026-06-29

## 목표

- Docker Spark cluster에서 Taxi Gold Parquet 결과를 local fallback 파일로 만든 뒤 업로드하는 경로가 아니라, Spark writer가 `s3a://` output prefix에 직접 쓰는 smoke를 구현하고 검증한다.

## 범위

- `Week2TaxiSparkRunner`에 direct S3A output option을 추가한다.
- 기존 local fallback write와 `Week2StorageAdapter` upload 경로는 유지한다.
- Docker evidence script에 작은 Taxi input용 `direct-s3a-small` mode를 추가한다.
- 같은 방식의 5GB 재실행을 위해 `direct-s3a-5gb` mode와 명령을 남긴다.
- `Week2RunnerResult` 호환 summary에 input row/bytes, output row/bytes, output path, duration, task result를 남긴다.
- manual verification과 Source of Truth 문서에 adapter upload와 direct S3A write의 차이를 기록한다.

## 범위 제외

- real AWS S3/IAM 검증.
- Product Health 5GB direct S3A evidence.
- Airflow DAG 내부에서 Spark submit을 호출하는 구현.
- Docker Spark custom image 제작 또는 Hadoop AWS jar를 image에 bake-in 하는 작업.
- Taxi Gold metric 의미 확정. Taxi 집계는 계속 M2 runtime evidence용 scaffold이며 최종 transform 의미는 M3 소유다.

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
