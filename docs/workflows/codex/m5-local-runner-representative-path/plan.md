# M5 Local Runner Representative Path 계획

## 브랜치

- Branch: `codex/m5-local-runner-representative-path`
- Workspace: `docs/workflows/codex/m5-local-runner-representative-path`
- Created: 2026-06-26

## 목표

M5의 Week2 분석 대표 경로에서 `local_runner`가 실제 fixture를 읽고, output JSONL을 만들고, `ExecutionResult`와 `CatalogMetadata` persistence까지 같은 `run_id`로 이어지는지 확인한다.

이번 slice는 실제 Airflow/Spark 연결 전 기준점이다. 새 runner를 붙이지 않고, 현재 baseline이 발표 대표 경로의 증거를 어디까지 남기는지 테스트로 고정한다.

## 범위

- `Week2WorkflowService` + `Week2LocalRunner` + `Week2CatalogStore` 대표 경로 확인
- run metadata JSON, catalog metadata JSON, output JSONL이 같은 `run_id`로 묶이는지 focused test 추가
- workspace 품질/결정/다음 작업 기록

## 범위 제외

- 실제 Airflow webserver/scheduler/API/DAG 연결
- 실제 SparkRunner 연결
- M3 `TransformSpec` adapter 구현
- M1 UI 연결
- M6 Catalog-backed query 변경
- Source of Truth 계약 변경

## Slice Plan

### Slice 1 - Local Runner 대표 경로 증거

- 목표: Amazon Reviews JSON demo fixture가 M5 local runner를 통해 output/Catalog/run evidence로 이어지는지 고정한다.
- 작업:
  - 기존 workflow/catalog tests와 local runner 구현 확인
  - representative path test 추가
  - focused pytest 실행
  - workspace/report 기록
- 완료 기준:
  - [x] output JSONL 경로가 실제 생성됨을 확인한다.
  - [x] run output URI와 Catalog `s3_uri`가 같은 `run_id`를 가리킨다.
  - [x] Catalog metrics가 output rows/bytes와 일치한다.
  - [x] run metadata JSON과 catalog metadata JSON이 persistence store에 저장된다.

## 완료 기준

- [x] focused backend test가 통과한다.
- [x] M5 대표 경로가 실제 산출물 중심으로 설명 가능하다.
- [x] 실제 Airflow/Spark/M3 adapter는 후속 작업으로 분리되어 있다.
