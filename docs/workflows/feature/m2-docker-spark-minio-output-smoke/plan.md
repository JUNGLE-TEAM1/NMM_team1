# M2 Docker Spark MinIO output smoke 계획

## 브랜치

- Branch: `feature/m2-docker-spark-minio-output-smoke`
- Workspace: `docs/workflows/feature/m2-docker-spark-minio-output-smoke`
- Created: 2026-06-29

## 목표

- Docker Spark standalone 실행 경로에서 Taxi Gold Parquet을 만든 뒤, 같은 결과 파일을 MinIO/S3-compatible object path로 업로드하는 smoke를 재현 가능하게 만든다.
- 기존 `Week2StorageAdapter`와 `--minio-upload` 옵션을 재사용해서 local fallback path와 `s3://...` object path가 같은 run_id prefix를 공유하는지 확인한다.

## 범위

- `docker/m2-taxi-spark-docker-compose.yml`에 M2 Taxi evidence 전용 `m2-minio` service를 추가한다.
- `scripts/week2_m2_taxi_spark_docker_evidence.sh`에 작은 Taxi 파일용 MinIO smoke mode를 추가한다.
- Docker Spark + MinIO smoke 재실행 방법과 성공 기준을 `docs/07`에 남긴다.
- `docs/03`의 M2 Taxi evidence 설명을 현재 구현 범위에 맞게 갱신한다.

## 범위 제외

- Spark가 직접 `s3a://` 경로로 Parquet을 쓰는 구현.
- AWS S3, IAM, STS, multipart upload 같은 production object storage 구현.
- Product Health 5GB evidence.
- Airflow DAG 내부에서 Spark runner를 호출하는 구현.
- Docker Spark custom image 제작.

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

- [x] `docker compose` 설정이 유효하다.
- [x] `scripts/week2_m2_taxi_spark_docker_evidence.sh minio-small`이 작은 Taxi 입력으로 성공한다.
- [x] summary JSON에 input rows/bytes, duration, output path, output rows/bytes, `spark_upload_taxi_daily_metrics` 성공 task가 남는다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
