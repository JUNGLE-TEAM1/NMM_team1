# M2 Taxi scale evidence 계획

## 브랜치

- Branch: `feature/m2-taxi-scale-evidence`
- Workspace: `docs/workflows/feature/m2-taxi-scale-evidence`
- Created: 2026-06-27

## 목표

- TLC NYC Taxi `yellow_tripdata` Parquet을 PySpark local mode로 읽고, Taxi daily Gold metric Parquet을 생성하는 Spark 처리 경로를 증거로 남긴다.
- 가능하면 Spark local output을 MinIO/S3-compatible storage에도 업로드해 local fallback + object storage 경계를 함께 검증한다.
- 팀원이 약 5GB Taxi 데이터 묶음을 준비하면 같은 Spark 경로에 input만 바꿔 scale evidence를 다시 실행할 수 있게 재실행 명령과 경로를 남긴다.

## 범위

- `yellow_tripdata` 2019-2025 월별 Parquet 파일을 다운로드 후보로 사용한다. HEAD 기준 총 크기는 약 4.54 GiB, 십진 기준 약 4.87 GB다.
- Taxi runner가 단일 Parquet 파일뿐 아니라 Parquet 파일들이 들어 있는 디렉터리도 입력으로 받을 수 있게 한다.
- 입력 row 수, 입력 bytes, 실행 시간, Gold output row 수, Gold output bytes를 evidence summary로 기록한다.
- 실행 산출물은 `data/` 아래 ignored 경로에만 둔다.
- `.venv`에 PySpark를 추가하고 `backend/requirements.txt`에 같은 버전을 고정한다.
- 작은 Taxi Parquet 입력으로 PySpark local mode smoke를 실행한다.
- Spark local mode에서 Parquet 읽기, Taxi daily Gold metric 생성, Parquet 쓰기까지 확인한다.
- MinIO가 준비되면 Spark local output을 기존 `Week2StorageAdapter`로 MinIO/S3-compatible endpoint에 upload한다.
- Spark local 결과는 기존 M2 evidence result shape인 `Week2RunnerResult` 호환 필드와 summary JSON으로 남긴다.

## 범위 제외

- `fhvhv_tripdata`나 다른 TLC 타입은 이번 범위에서 제외한다. 파일은 더 크지만 현재 Taxi runner의 `yellow_tripdata` 컬럼 계약과 다르다.
- Docker Spark cluster 구성은 이번 범위에서 완성하지 않는다. 다만 M2 최종 완료 기준에서는 필요하므로 후속 작업으로 명확히 남긴다.
- Airflow DAG 내부에서 Spark runner를 호출하는 연결은 이번 범위에 포함하지 않는다.
- Spark가 `s3a://`로 직접 쓰는 경로는 이번 범위에서 완성하지 않는다. 이번 MinIO smoke는 Spark local write 후 기존 storage adapter upload로 확인한다.
- 약 5GB Taxi 데이터 실제 실행은 데이터 묶음이 아직 준비되지 않았으면 pending으로 남긴다.
- Taxi 품질 규칙을 최종 확정하거나 M3 TransformSpec을 대체하지 않는다.
- 다운로드한 원본 Parquet 파일은 Git에 커밋하지 않는다.

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

- [ ] 범위 완료
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
