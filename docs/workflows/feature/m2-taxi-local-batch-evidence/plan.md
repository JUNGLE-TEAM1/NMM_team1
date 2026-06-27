# M2 Taxi local batch evidence 계획

## 브랜치

- Branch: `feature/m2-taxi-local-batch-evidence`
- Workspace: `docs/workflows/feature/m2-taxi-local-batch-evidence`
- Created: 2026-06-27

## 목표

- TLC NYC Yellow Taxi 2024-01 Parquet을 M2 batch runner로 처리할 수 있는 첫 로컬 evidence 경로를 만든다.
- 작은 test fixture로 daily Gold metric 계산을 고정하고, 실제 로컬 파일은 `fixed` 또는 `local-full-month` manual evidence로 실행할 수 있게 한다.
- 다음 MinIO/S3, PySpark, Airflow DAG integration으로 갈 수 있도록 입력/output/metric 경계를 `Week2RunnerResult` 호환 shape로 유지한다.

## 범위

- `backend/app/services/week2_taxi_batch_runner.py`를 추가해 Taxi Parquet 입력을 읽고 `gold_taxi_daily_metrics` Parquet output을 쓴다.
- `scripts/week2_m2_taxi_local_batch_evidence.py`를 추가해 사람이 로컬 Taxi 파일 경로로 runner를 실행하고 evidence JSON을 받을 수 있게 한다.
- 테스트용 작은 Parquet fixture로 `fixed`/daily metric/invalid row count/output Parquet을 검증한다.
- workspace 문서에 이 Phase의 범위, 검증, 보류 결정을 기록한다.

## 범위 제외

- PostgreSQL `public.taxi_trips` loader 구현.
- MinIO/S3 실제 write.
- PySpark 또는 distributed Spark cluster 실행.
- Airflow DAG 내부에서 SparkRunner 또는 Taxi runner를 호출하는 구현.
- TLC Taxi multi-month/year 또는 전체 dataset 적재.
- M1 UI, M5 workflow API, M6 SQL/RAG 화면 변경.

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

- needed

### Step 1 - Taxi runner core

#### 목표

- 작은 Parquet fixture를 읽어 daily metric Gold Parquet을 만드는 runner를 구현한다.

#### 범위

- required Taxi columns 검증
- `demo`, `fixed`, `local-full-month` profile option
- row count, bytes, duration, output path metric 반환

#### 범위 제외

- PostgreSQL, MinIO/S3, PySpark, Airflow DAG

#### 구현 프롬프트

```text
@AGENTS.md @docs/workflows/feature/taxi-dataset-bootstrap/notes.md

TDD로 Taxi daily metric runner를 구현한다.
```

#### 검증 프롬프트

```text
@AGENTS.md @docs/12-quality-gates.md

focused test와 full backend test를 실행하고 quality.md에 기록한다.
```

#### 완료 기준

- [ ] 작은 Parquet fixture가 daily Gold Parquet output으로 변환된다.
- [ ] invalid row count가 output metric에 반영된다.
- [ ] CLI가 summary JSON을 출력한다.

### Step 2 - Local Taxi file evidence

#### 목표

- 사용자가 내려받은 `yellow_tripdata_2024-01.parquet`로 fixed 또는 full-month local evidence를 실행할 수 있는지 확인한다.

#### 범위

- 로컬 파일 존재 여부 확인
- fixed date 실행 우선
- 시간이 허용되면 local-full-month 실행
- 결과는 gitignore된 `data/` 아래에 둔다.

#### 범위 제외

- 원본/결과 데이터 commit
- 성능 최적화나 Spark 전환

## 완료 기준

- [ ] 범위 완료
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
- [ ] 실제 대용량 파일을 commit하지 않았음을 확인
