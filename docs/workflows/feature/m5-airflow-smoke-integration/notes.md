# M5 Airflow smoke integration 노트

## 진행 메모

- 추천안대로 별도 Airflow compose, repo DAG, shared local volume, result JSON artifact 방식을 구현했다.
- Airflow DAG는 contracts와 sample JSONL을 읽고, demo workflow와 같은 Source -> Select/Filter -> Cast/Normalize -> Aggregate -> Load 결과를 만든다.
- Backend `Week2AirflowAdapter`는 DAG trigger 시 `conf.airflow_result_file=<run_id>.json`을 넘기고, DAG success 후 `data/week2/_airflow_results/<run_id>.json`을 읽는다.
- 실제 smoke run `run_reviews_demo_065`에서 Airflow DAG state `success`, backend run status `succeeded`, output JSONL 3 rows, Catalog row_count 3/bytes 195를 확인했다.

## 결정

- local smoke 수준의 Airflow 연결 완료로 본다.
- production deploy, MinIO/S3, SparkRunner, async UI는 후속 작업으로 남긴다.

## 열린 질문

- 포트 `8080` 충돌 시 `AIRFLOW_PORT`를 다른 값으로 바꿔 실행할지 결정하면 된다.

## 링크 / 증거

- Airflow UI: `http://localhost:8080` (`airflow` / `airflow`)
- Result artifact: `data/week2/_airflow_results/run_reviews_demo_065.json`
- Output dataset: `data/week2/reviews/gold/run_id=run_reviews_demo_065/dataset_reviews_gold.jsonl`
