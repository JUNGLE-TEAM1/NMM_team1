# M5 Runner Selection Catalog Guard 계획

## 브랜치

- Branch: `codex/m5-runner-selection-catalog-guard`
- Workspace: `docs/workflows/codex/m5-runner-selection-catalog-guard`
- Created: 2026-06-26

## 목표

M5 `Week2WorkflowService`가 기존 local runner / Airflow fallback / Catalog persistence baseline을 깨지 않으면서, 후속 M2 `SparkRunner`와 M3 `TransformSpec` adapter가 붙을 수 있는 runner selection 및 Catalog guard 기준을 얇게 정리한다.

이번 Phase는 slice마다 새 하네스 전체를 반복하지 않는다. Phase 시작과 종료에만 넓은 문맥/검증을 사용하고, 각 slice는 focused code/test loop로 처리한다.

## 현재 기준

- 이미 구현됨:
  - `Week2LocalRunner` baseline
  - `Week2AirflowAdapter` boundary
  - Airflow unavailable/failed 시 local runner fallback
  - `Week2RunnerResult` compatible result shape
  - successful run status에서만 Catalog latest update
  - local JSON metadata handoff persistence
- 아직 구현 안 됨:
  - 실제 외부 Airflow webserver/scheduler/API/DAG 연결
  - 실제 `SparkRunner` 연결
  - M3 `TransformSpec` adapter 실행
  - Parquet/MinIO actual output
  - SQLite/Postgres Catalog DB persistence

## 범위

- M5 현재 구현/gap 문서화
- runner selection / catalog guard slice plan 고정
- focused backend test로 baseline 확인
- 필요 시 작은 guard만 구현:
  - unknown executor가 조용히 Airflow fallback으로 처리되지 않게 막기
  - future `spark` executor는 실제 구현 전 명시적으로 deferred/unsupported 처리

## 범위 제외

- 실제 Airflow 연결 구현
- 실제 Spark 실행 구현
- M3 JSON profile/schema inference 또는 `TransformSpec` 생성
- M1 UI 연결
- M6 Catalog-backed query 전환
- shared contract 대규모 재설계
- branch sync를 위한 pull/merge/rebase

## 경량 Slice 운영 원칙

### Phase 시작 때 한 번만 한다

- branch/workspace 생성
- 현재 sync 상태 기록
- 필요한 ver2 문서와 현재 M5 baseline 문맥 읽기
- 전체 slice plan 작성
- `sources.md`, `sync.md`, `decisions.md`에 시작 기준 기록

### 각 slice마다 반복하지 않는다

- 새 branch 생성
- 새 workspace 생성
- GitHub issue 생성
- Source of Truth 전체 재독해
- `docs/05`, `docs/06`, `docs/07` 전체 재검토
- full backend test, frontend build, Docker smoke
- `scripts/validate-harness.sh --strict`
- slice별 full report 작성

### 각 slice마다 하는 최소 루프

1. `plan.md`의 해당 slice 체크박스를 기준으로 진행한다.
2. 필요한 코드/테스트 파일만 읽는다.
3. 작게 구현하거나 테스트를 추가한다.
4. focused pytest만 실행한다.
5. `quality.md`에 명령/result 한 줄을 기록한다.
6. 다음 slice에 영향을 주는 사실만 `notes.md`에 짧게 기록한다.

### Phase 종료 때 한 번만 한다

- M5 focused tests 전체 실행
- 필요 시 backend tests 전체 실행
- 문서 변경이 있으면 harness validation 1회
- `report.md`, `next-actions.md`, `shared-docs.md` 정리
- PR 준비 여부 판단

## Slice Plan

### Slice 1 - Baseline 확인

- 목표: 현재 M5 baseline이 살아 있는지 확인한다.
- 작업:
  - focused M5/M6 tests 실행
  - 현재 구현/gap을 `notes.md`에 짧게 기록
- 완료 기준:
  - [x] focused test 결과가 `quality.md`에 기록되어 있다.
  - [x] 이미 구현된 것과 남은 gap이 `notes.md`에 기록되어 있다.

### Slice 2 - Executor Guard 확인/보강

- 목표: 알 수 없는 executor가 Airflow fallback으로 조용히 처리되지 않게 한다.
- 작업:
  - 현재 API schema/service behavior 확인
  - 필요하면 service-level test와 최소 guard 추가
- 완료 기준:
  - [x] unknown executor 처리 기준이 test 또는 notes로 고정되어 있다.
  - [x] focused workflow/catalog test가 통과한다.

### Slice 3 - Future Runner Defer 명시

- 목표: 실제 SparkRunner/Airflow 연결은 후속 slice임을 코드/문서 기준에서 혼동 없이 남긴다.
- 작업:
  - `spark` executor 또는 `runtime_config.runner=spark` 처리 범위 확인
  - 실제 Spark 구현 없이 deferred/unsupported 기준만 기록하거나 guard한다.
- 완료 기준:
  - [x] SparkRunner actual integration이 후속 slice로 분리되어 있다.
  - [x] local runner baseline이 깨지지 않는다.

### Slice 4 - Final 검증/보고

- 목표: 이번 Phase에서 한 문서/코드 변경을 검증하고 다음 작업자를 위한 handoff를 남긴다.
- 작업:
  - focused tests 재실행
  - 필요한 경우 더 넓은 backend/harness validation 실행
  - report/next-actions 정리
- 완료 기준:
  - [x] `quality.md`에 최종 검증 결과가 있다.
  - [x] `report.md`와 `next-actions.md`가 이번 Phase 결과와 후속 slice를 설명한다.

### Slice 5 - RuntimeConfig Future Runner Guard

- 목표: `contracts/runtime_config.sample.json`에 future `spark_runner`가 등장하더라도, 현재 M5 service/API가 실제 구현 전 이를 실행 가능한 executor처럼 받아들이지 않게 한다.
- 작업:
  - unknown executor guard test를 `spark`, `spark_runner`, typo 값으로 확장한다.
  - 실제 SparkRunner 구현은 하지 않는다.
- 완료 기준:
  - [x] `spark_runner`가 run 생성 전 거부됨이 focused test로 고정되어 있다.
  - [x] RuntimeConfig/SparkRunner actual integration은 후속 slice로 남아 있다.

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md
@docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md
@docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md

이 workspace의 slice plan만 따른다.
Phase 시작/종료 문서는 한 번만 다루고, 각 slice는 focused code/test loop로 처리한다.
local runner baseline, Airflow fallback boundary, Catalog latest successful run guard를 깨지 않는다.
실제 Airflow/Spark/M3 TransformSpec 구현은 이번 Phase 범위에 포함하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/12-quality-gates.md

각 slice는 focused pytest 결과만 `quality.md`에 기록한다.
Phase 종료 때 필요한 경우에만 더 넓은 backend 또는 harness validation을 실행한다.
```

## 완료 기준

- [x] M5 현재 구현/gap이 문서화되어 있다.
- [x] slice별 경량 하네스 운영 원칙이 workspace에 기록되어 있다.
- [x] focused backend test 결과가 기록되어 있다.
- [x] 필요한 작은 guard가 구현되었거나 보류 사유가 기록되어 있다.
- [x] 실제 Airflow/Spark/M3 adapter는 후속 slice로 분리되어 있다.
