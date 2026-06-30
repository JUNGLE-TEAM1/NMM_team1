# Target Dataset job draft 결정 기록

| Decision | Status | Rationale |
| --- | --- | --- |
| draft 저장 단위 | accepted | Target Dataset과 ETL job definition을 하나의 `target_dataset_drafts` metadata record로 저장한다. C-4 run handoff가 이 record를 소비한다. |
| Silver output 저장 | accepted | Silver Dataset은 별도 생성 entity가 아니라 draft payload의 `silver_outputs[]` intermediate output으로 저장한다. |
| 실행 제외 | accepted | C-3는 metadata persistence Phase라 Airflow/Spark/local runner 실행을 호출하지 않는다. |
