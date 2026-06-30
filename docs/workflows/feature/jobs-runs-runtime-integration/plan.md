# Jobs runs runtime integration 계획

## 목표

Jobs와 Runs를 분리된 관리 개념으로 정리하고, local runner, Airflow trigger, Spark runner 결과를 같은 Run record 형태로 볼 수 있게 한다.

## 상태

- 2026-06-30: 계획 생성. Airflow DAG와 Spark cluster는 실제 실행 가능함이 확인됐지만 AskLake Run record와 UI 연동은 아직 정렬이 필요하다.

## 범위

- Job definition과 Run record 경계 정리.
- local runner/Airflow/Spark executor status shape 정렬.
- Airflow trigger result artifact를 Run record로 ingest.
- Spark runner 또는 cluster job evidence를 Run record에 연결.
- `/runs`에서 executor별 상태와 output evidence 표시.

## 제외 범위

- Airflow 운영 스케줄러 등록.
- Spark streaming.
- retry/backfill orchestration 완성.
- Catalog publish/AI Query 소비.

## 선행 조건

- Runs runtime panel restore.
- Gold Dataset runtime materialization.
- Airflow DAG trigger evidence.
- Spark cluster job evidence.

## 구현 대상 파일 예상

- `backend/app/services/job_orchestrator.py`
- `backend/app/services/week2_airflow_adapter.py`
- `backend/app/services/week2_spark_runner.py`
- `backend/app/api/week2_workflow.py`
- `frontend/src/app/App.jsx`
- focused tests for executor result mapping

## Acceptance Criteria

- Jobs는 definition/schedule/edit 대상이고 Runs는 execution evidence 대상임이 UI에서 구분된다.
- local runner, Airflow, Spark 결과가 같은 Run card/detail shape로 보인다.
- Airflow success artifact가 Run record에 연결된다.
- Spark cluster job success가 evidence로 표시된다.

## Regression / Failure Scenario

- Draft/Job/Run이 같은 목록에 섞여 의미가 흐려지면 실패다.
- Airflow queued 상태가 succeeded로 보이면 실패다.
- Spark readiness만으로 Run success가 생성되면 실패다.

## Manual Verification

1. Job definition을 확인한다.
2. local runner run을 생성한다.
3. Airflow trigger run을 생성한다.
4. Spark evidence run을 확인한다.
5. `/runs`에서 세 결과의 공통/차이 필드를 확인한다.

## Report 기준

- `docs/reports/jobs-runs-runtime-integration.md`에 executor별 Run shape와 UI smoke를 기록한다.
