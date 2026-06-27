# M2 MinIO S3-compatible storage adapter 계획

## 브랜치

- Branch: `feature/m2-storage-adapter`
- Workspace: `docs/workflows/feature/m2-storage-adapter`
- Created: 2026-06-27

## 목표

- M2 runner가 결과 파일 위치를 직접 문자열로 조립하지 않고, `RuntimeConfig.storage`와 storage adapter를 통해 `s3_uri`, `prefix`, local fallback path를 일관되게 계산하게 한다.
- 이번 PR은 실제 AWS S3 업로드가 아니라 MinIO/S3-compatible 경로 계약과 local fallback write를 고정하는 첫 slice다.

## 범위

- `StorageConfig`와 storage location 계산 모델을 추가한다.
- local fallback root와 S3-compatible bucket/prefix 규칙을 하나의 adapter로 묶는다.
- `Week2SparkRunner`가 `output_path` 직접 지정뿐 아니라 `output_root` + `storage` 설정으로 Parquet 결과를 쓸 수 있게 한다.
- `Week2WorkflowService`가 Catalog의 `s3_uri`, `storage.prefix`, `storage.local_fallback_path`를 같은 storage adapter 결과로 채우게 한다.
- `contracts/runtime_config.sample.json`, `contracts/catalog_metadata.sample.json`, `docs/03`, `docs/05`, `docs/07`에 storage path 결정 사항을 반영한다.
- focused test와 Week2 workflow contract test로 `s3://asklake-demo/...` URI와 local fallback path가 같은 prefix를 공유하는지 검증한다.

## 범위 제외

- 실제 MinIO 서버 실행, bucket 생성, object upload API 호출.
- AWS S3 credential, endpoint secret, IAM, region 설정.
- Spark cluster 또는 PySpark distributed execution.
- M3 TransformSpec/quality rule 처리.
- Taxi 이상 날짜 필터링 또는 데이터 품질 판단.
- M5 Airflow DAG 내부에서 Spark를 호출하는 구현.
- M6 SQL engine smoke.

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

- [ ] `StorageConfig`/adapter가 S3-compatible URI와 local fallback path를 같은 prefix에서 계산한다.
- [ ] `Week2SparkRunner`가 storage adapter 경로로 Parquet output을 만들고 `Week2RunnerResult.output_path`를 local fallback path로 반환한다.
- [ ] `Week2WorkflowService` Catalog metadata가 adapter 결과의 `s3_uri`, `prefix`, `local_fallback_path`를 사용한다.
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
