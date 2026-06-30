# Airflow trigger readiness 계획

## 목표

`Week2AirflowAdapter`의 env 기반 Airflow DAG trigger 경계를 UI와 문서에서 확인 가능하게 만들고, 실제 Airflow가 없는 상태와 local fallback을 구분한다.

## 상태

- 2026-06-30: 구현 완료. `/api/week2/airflow/readiness`와 `/runs` read-only panel을 추가하고 env missing fallback 상태를 검증했다.

## 범위

- Airflow env readiness 표시.
- DAG id, base URL, result artifact root 설정 상태 표시.
- executor가 `airflow`일 때 실제 trigger 가능/불가능 상태 설명.
- fallback 여부를 Run detail에서 명확히 표시.

## 제외 범위

- Airflow 서버 기동.
- DAG 파일 작성/배포.
- credential 값 저장.
- 실제 DAG 성공 보장.

## 선행 조건

- `backend/app/services/week2_airflow_adapter.py` 유지.
- `Week2WorkflowService`의 airflow fallback behavior 이해.

## 구현 대상 파일 예상

- `backend/app/api/week2_workflow.py` 또는 readiness endpoint
- `backend/app/services/week2_airflow_adapter.py`
- `frontend/src/app/App.jsx`
- tests for env missing/readiness shape

## API/contract 영향

- Airflow readiness response가 추가될 수 있다.
- 기존 workflow run trigger contract는 유지한다.

## UI 영향

- Gold Build/Spark/Airflow 실행 방식 선택 근처에 Airflow readiness 표시.
- env missing이면 `실행 불가` 또는 `fallback 예정`을 보여준다.

## Acceptance Criteria

- Airflow env가 없으면 `not configured`로 표시된다.
- Airflow executor 선택 시 fallback과 실제 trigger의 차이를 볼 수 있다.
- 실제 credential 값은 UI/API response에 노출되지 않는다.

## Regression / Failure Scenario

- env missing이 run succeeded로 오해되지 않는다.
- Airflow 실패 후 local fallback이면 `fallback_succeeded` 또는 로그가 명확하다.

## Manual Verification

1. Airflow env 없이 readiness 확인.
2. Airflow executor 선택 시 안내 확인.
3. 가능하면 테스트 env로 failed/fallback 상태 확인.

## Data / Evidence 확인 항목

- `ASKLAKE_WEEK2_AIRFLOW_BASE_URL`
- `ASKLAKE_WEEK2_AIRFLOW_DAG_ID`
- `ASKLAKE_WEEK2_AIRFLOW_RESULT_ROOT`
- `data/week2/_airflow_results`

## Blocked Condition

- 실제 Airflow URL/DAG/credential/result artifact path가 없다.
- DAG가 Week2 result artifact contract를 쓰지 않는다.

## Report 기준

- `docs/reports/airflow-trigger-readiness.md`에 env 상태, fallback 상태, 실제 trigger 여부를 기록한다.
