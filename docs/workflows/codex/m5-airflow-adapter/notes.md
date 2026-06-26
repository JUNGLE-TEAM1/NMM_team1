# M5 Airflow Adapter notes

## 시작 시 확인한 점

- `backend/app/services/week2_airflow_adapter.py`는 현재 `Week2AirflowUnavailableError`만 발생시킨다.
- `Week2WorkflowService`는 `airflow` executor가 실패하거나 unavailable이면 local runner fallback을 수행한다.
- 후속 adapter는 `Week2RunnerResult` shape를 반환해야 한다.
- Airflow가 성공했더라도 M5가 받을 output evidence가 없으면 Catalog를 업데이트하면 안 된다.

## 이번 slice 핵심

- Airflow API 연결은 "DAG가 끝났다"만 확인하면 부족하다.
- M5가 필요한 것은 `output_path`, `row_count`, `bytes`, `task_results`, `logs` 같은 실행 증거다.
- 따라서 adapter는 Airflow success response에서 `week2_result` payload를 찾아 `Week2RunnerResult`로 바꾸고, 없으면 failed result로 fallback을 유도한다.

## 구현 결과

- `Week2AirflowConfig`는 env 기반 설정을 지원한다.
- 설정 env가 없으면 기존처럼 `Week2AirflowUnavailableError`가 발생하고 M5 local fallback이 동작한다.
- fake HTTP client로 DAG trigger request와 DAG run polling request를 검증했다.
- Airflow success response에 `week2_result.output_path`가 없으면 `failed` result를 반환해 Catalog publish를 막는다.
