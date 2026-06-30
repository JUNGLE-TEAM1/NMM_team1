# Local runner materialization 계획

## 목표

queued Gold Build Job Run을 `local_runner`로 실행해 계획된 Silver/Gold JSONL evidence를 만들고 run record에 output 증거를 남긴다.

## 범위

- `POST /api/target-dataset-job-runs/{run_id}/execute`
- `data/dataset_runs/<run_id>/silver/*.jsonl`
- `data/dataset_runs/<run_id>/gold/*.jsonl`
- `status`, `output_path`, `row_count`, `output_bytes`, `silver_output_paths`, `logs` 저장
- `/runs`의 `Local 실행` 버튼

## 제외

- Airflow trigger
- Spark runner
- 5GB 실제 처리
- CatalogMetadata publish
- 데이터 카탈로그 반영
