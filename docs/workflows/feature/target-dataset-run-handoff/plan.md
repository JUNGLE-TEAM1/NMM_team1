# Target Dataset run handoff 계획

## 목표

`작업 > Gold Build Jobs`에서 저장된 Target Dataset 정의를 queued `Job Run` record로 넘기고, `실행 기록`에서 조회한다.

## 범위

- `POST /api/target-dataset-job-runs`
- `GET /api/target-dataset-job-runs`
- `GET /api/target-dataset-job-runs/{run_id}`
- Gold Build Jobs의 `Run 준비` 버튼
- 실행 기록 목록 표시

## 제외

- Airflow DAG trigger
- local/spark runner 실행
- Silver/Gold materialization
- CatalogMetadata publish
