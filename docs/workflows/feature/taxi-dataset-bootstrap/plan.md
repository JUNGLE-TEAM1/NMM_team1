# M2 taxi dataset bootstrap 계획

## 브랜치

- Branch: `feature/taxi-dataset-bootstrap`
- Workspace: `docs/workflows/feature/taxi-dataset-bootstrap`
- Created: 2026-06-25

## 목표

- M2 정형 Batch가 사용할 NYC TLC Taxi 데이터셋 후보와 첫 데모 범위를 정한다.
- 기존 `contracts/*.sample.json`을 기준으로 M2가 생산하거나 채워야 할 계약 값을 정리한다.
- M2의 첫 PR을 실제 구현이 아니라 `Taxi dataset bootstrap` 범위로 제한해 M1 UI, M5 Workflow/Catalog, M6 SQL/RAG가 소비할 수 있는 기준을 만든다.

## 범위

- NYC TLC Trip Record Data 중 M2 데모에 사용할 후보를 정한다.
  - 기본 후보: Yellow Taxi monthly Parquet
  - 권장 시작점: schema 변동 위험을 줄이기 위해 2024년 월별 파일 중 1개를 선택한다.
  - 보류: 정확한 월, row 수, date range는 데이터 크기와 팀 통합 일정 확인 후 이 branch에서 확정 또는 후보로 남긴다.
- M2 Taxi Batch 데이터 범위 초안을 정한다.
  - `demo`: 화면과 smoke 확인용 작은 row 수
  - `fixed`: 리뷰/검산에 반복 사용 가능한 고정 범위
  - `extended`: 처리 규모를 보여줄 확장 범위
- PostgreSQL 적재 대상 초안을 정한다.
  - source type 후보: `postgres_taxi`
  - table 후보: `taxi_trips`
  - 주요 시간 컬럼 후보: `tpep_pickup_datetime`, `tpep_dropoff_datetime`
  - 주요 측정 컬럼 후보: `trip_distance`, `passenger_count`, `fare_amount`, `total_amount`
- 기존 계약 파일 기준으로 M2 mapping을 정리한다.
  - `contracts/source_config.sample.json`: M2 `SourceConfig`에 들어갈 `source_type`, `connection_ref`, `options` 후보
  - `contracts/workflow_definition.sample.json`: M5가 실행할 Taxi Batch workflow에서 M2 source/task가 어떤 node로 나타나는지 후보
  - `contracts/execution_result.sample.json`: M2가 batch 실행 후 채울 `run_id`, `row_count`, `bytes`, `outputs`, `task_results`, `lineage` 후보
  - `contracts/catalog_metadata.sample.json`: M2 Gold dataset이 Catalog에 등록될 때 필요한 `dataset_id`, `s3_uri`, `schema`, `metrics`, `lineage`, `query` 후보
- 원본 데이터와 생성 산출물의 commit 금지 기준을 정한다.
  - 대용량 원본 Parquet, local Postgres volume, MinIO object, 생성된 Bronze/Gold Parquet은 commit하지 않는다.
  - 필요한 경우 다운로드 URL, 파일명, row/date 범위, 검증 명령만 문서화한다.
- M1/M5/M6 handoff 관점에서 남은 질문을 `notes.md` 또는 `decisions.md`에 정리한다.

## 범위 제외

- 실제 NYC TLC 데이터 다운로드 자동화 구현
- 실제 PostgreSQL 적재 스크립트 구현
- PostgreSQL connector 또는 API 구현
- Bronze/Gold Parquet 생성 구현
- MinIO bucket/path 실제 생성
- Airflow DAG, local runner, retry 실행 구현
- UI 구현 또는 화면 라우팅 변경
- M3 Amazon Reviews 중심 기존 contract 샘플을 Taxi 전용으로 덮어쓰기
- 대용량 데이터 파일, credential, secret, local artifact commit

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/README.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/project-context/asklake-week2-module-plan/plan.md`
- `contracts/source_config.sample.json`
- `contracts/workflow_definition.sample.json`
- `contracts/execution_result.sample.json`
- `contracts/catalog_metadata.sample.json`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md
@docs/project-context/asklake-week2-module-plan/README.md
@docs/project-context/asklake-week2-module-plan/decisions.md
@docs/project-context/asklake-week2-module-plan/plan.md
@contracts/source_config.sample.json
@contracts/workflow_definition.sample.json
@contracts/execution_result.sample.json
@contracts/catalog_metadata.sample.json

M2 정형 Batch 담당자의 첫 PR로, 실제 구현 없이 Taxi dataset bootstrap 계획만 정리한다.
NYC TLC Taxi 데이터 후보, demo/fixed/extended 범위, PostgreSQL table 초안, 기존 contracts에 대한 M2 mapping을 작성한다.
기존 Amazon Reviews 중심 contract 샘플을 Taxi 전용으로 덮어쓰지 않는다.
대용량 데이터 다운로드, PostgreSQL 적재, connector 구현, Parquet 생성, UI 구현은 범위에서 제외한다.
필요한 경우 후속 branch 후보를 next-actions.md에 남긴다.
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

- [ ] M2 Taxi 데이터 후보와 권장 시작 파일 또는 선택 기준이 기록되어 있다.
- [ ] `demo`, `fixed`, `extended` 데이터 범위 초안이 기록되어 있다.
- [ ] PostgreSQL 적재 대상 table, 주요 시간 컬럼, 주요 metric 컬럼 후보가 기록되어 있다.
- [ ] `source_config`, `workflow_definition`, `execution_result`, `catalog_metadata`에 대한 M2 mapping이 기록되어 있다.
- [ ] 대용량 원본/생성 데이터 commit 금지 기준이 기록되어 있다.
- [ ] 실제 다운로드, 적재, connector, Parquet 생성, UI 구현은 후속 branch로 분리되어 있다.
- [ ] M1/M5/M6와 맞춰야 할 열린 질문이 `notes.md`, `decisions.md`, 또는 `next-actions.md`에 기록되어 있다.
- [ ] 문서 전용 작업으로 TDD 생략 사유가 `quality.md`에 기록되어 있다.
- [ ] 필요한 정적 검증 또는 skip reason이 `quality.md`에 기록되어 있다.
- [ ] `report.md`가 이번 branch의 변경, 검증, 남은 작업을 요약한다.
