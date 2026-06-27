# M2 MinIO 실제 업로드 smoke 계획

## 브랜치

- Branch: `feature/m2-minio-object-upload`
- Workspace: `docs/workflows/feature/m2-minio-object-upload`
- Created: 2026-06-27

## 목표

- M2 `Week2StorageAdapter`가 local fallback Parquet 파일을 실제 MinIO/S3-compatible endpoint에 업로드할 수 있음을 증명한다.
- `RuntimeConfig.storage`의 bucket/prefix/local fallback 계약을 유지하면서 object upload는 opt-in smoke로만 켠다.
- secret 값은 Git에 남기지 않고 환경 변수 이름만 계약에 남긴다.

## 범위

- `StorageConfig`에 local MinIO upload smoke에 필요한 endpoint, region, credential env name, bucket auto-create option을 추가한다.
- `Week2StorageAdapter`에 S3-compatible signed `PUT` upload 기능을 추가한다.
- `Week2SparkRunner`가 `options.upload_to_object_storage=true`일 때 local Parquet write 뒤 object upload task를 기록하게 한다.
- 실제 MinIO endpoint로 재현 가능한 smoke CLI를 추가한다.
- 관련 fixture와 Source of Truth 문서의 최소 계약 문구를 갱신한다.

## 범위 제외

- AWS S3 production credential, IAM, region 정책 확정.
- Spark cluster 또는 PySpark distributed execution.
- M3 `TransformSpec` / `QualityRule` 실행.
- M5 Airflow DAG 내부 Spark 호출.
- M6 SQL smoke, SQL planner, AI Query 연결.
- MinIO를 기본 `docker compose up` 경로에 강제 추가하는 작업.

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
