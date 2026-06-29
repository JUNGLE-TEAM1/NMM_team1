# M2 Airflow SparkRunner handoff 노트

## 진행 메모

- M5 `Week2AirflowAdapter`는 Airflow DAG 성공 후 shared result artifact를 읽을 수 있다.
- M2가 해야 할 일은 Airflow 자체 구현이 아니라, DAG task가 실행할 수 있는 runner CLI와 표준 artifact를 제공하는 것이다.
- CLI는 `contracts/runtime_config.sample.json`의 `airflow_sparkrunner_handoff` profile 또는 직접 RuntimeConfig JSON을 받아 `Week2SparkRunner`를 실행한다.
- artifact 위치 기본값은 `data/week2/_airflow_results/<run_id>.json`이고, wrapper key는 `week2_result`다.

## 결정

- Airflow DAG 내부에서 backend service를 직접 import하지 않고 CLI 호출 경계를 우선 제공한다.
- Airflow service/DAG/scheduler/Catalog persistence는 M5 책임으로 유지한다.
- Spark direct `s3a://` write는 이 branch에서 하지 않고 다음 Phase로 분리한다.

## 열린 질문

- M5 PR에서 실제 DAG task가 이 CLI를 호출할지, 기존 legacy reviews DAG와 별도 Product Health DAG에 붙일지는 M5가 결정한다.
- Product Health 5GB 입력과 M3 최종 TransformSpec이 준비되면 같은 handoff shape로 profile을 확장할 수 있다.

## 링크 / 증거

- GitHub issue: #270
- Focused test: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_airflow_sparkrunner_handoff.py -q` -> `1 passed`
- Integration focused tests: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_airflow_sparkrunner_handoff.py backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_workflow_catalog.py -q` -> `22 passed`
- CLI smoke: `PYTHONPATH=backend .venv/bin/python scripts/week2_m2_airflow_sparkrunner_handoff.py --runtime-profile airflow_sparkrunner_handoff --run-id run_airflow_spark_001 --result-path data/week2/_airflow_results/run_airflow_spark_001.json` -> `status=succeeded`
