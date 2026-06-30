# Target Dataset multi-source processing 다음 행동

1. C-3 `target-dataset-job-draft`에서 Review payload를 저장하는 API/schema를 추가한다.
2. 저장 payload는 `source_refs[]`, `base_source_ref`, `target_grain`, `silver_outputs[]`, `processing_recipes[]`, `executor_handoff`, `schedule`을 포함한다.
3. C-4에서 저장된 job draft를 M5 run 생성 또는 Airflow DAG conf로 넘긴다.
