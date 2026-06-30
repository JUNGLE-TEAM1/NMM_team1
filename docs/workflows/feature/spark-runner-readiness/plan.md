# Spark runner readiness 계획

## 목표

`Week2WorkflowService`의 `spark_runner` 경로와 `Week2SparkRunner`의 현재 제한을 UI에서 확인 가능하게 만들고, local smoke와 distributed Spark 실행을 구분한다.

## 상태

- 2026-06-30: 구현 완료. `/api/week2/spark/readiness`와 `/runs` read-only panel을 추가하고 local smoke/distributed cluster 경계를 검증했다.

## 범위

- Spark runner readiness 표시.
- 현재 실행 가능한 source type이 `local_file` 중심임을 표시.
- Spark local smoke 결과 또는 dependency missing 상태 표시.
- distributed Spark cluster 실행은 별도 후속으로 분리.

## 제외 범위

- Spark cluster 기동.
- Docker Spark cluster 실행.
- Kafka/S3/DB source Spark read.
- Product Health 대용량 ETL 재실행.

## 선행 조건

- `backend/app/services/week2_workflow.py`
- `backend/app/services/week2_spark_runner.py`
- `contracts/runtime_config.sample.json`

## 구현 대상 파일 예상

- readiness endpoint 또는 existing workflow executor info 확장
- `frontend/src/app/App.jsx`
- focused tests

## API/contract 영향

- Runner readiness response가 추가될 수 있다.
- `RuntimeConfig.runner.allowed`를 UI 설명에 반영한다.

## UI 영향

- Gold Build 실행 방식에서 Spark runner의 `local smoke ready / dependency missing / cluster not configured` 상태를 표시한다.
- Spark 선택이 실제 distributed job으로 오해되지 않게 한다.

## Acceptance Criteria

- Spark runner 상태가 UI에 보인다.
- unsupported source type은 명확히 제한으로 표시된다.
- local_file smoke와 distributed cluster 실행이 분리되어 보인다.

## Regression / Failure Scenario

- Spark dependency가 없어도 전체 앱이 실패하지 않는다.
- `spark_runner`가 `s3/postgres/mongodb/kafka`를 지원하는 것처럼 표시하지 않는다.

## Manual Verification

1. Spark readiness panel 확인.
2. local_file smoke contract 표시 확인.
3. unsupported source type 안내 확인.

## Data / Evidence 확인 항목

- `contracts/runtime_config.sample.json`
- `data/week2`
- `data/results/m2_*`

## Blocked Condition

- 실제 Spark cluster demo가 요구되지만 cluster endpoint/master가 없다.
- PySpark dependency가 로컬 환경에 없다.

## Report 기준

- `docs/reports/spark-runner-readiness.md`에 local smoke/distributed 실행 경계를 기록한다.
