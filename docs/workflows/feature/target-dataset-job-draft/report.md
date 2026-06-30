# Target Dataset job draft 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Target Dataset / ETL job draft metadata 저장 API와 SQLite persistence를 추가하고, Target Dataset Review CTA를 실제 저장 버튼으로 연결했다.
- Follow-up change: Target Dataset wizard에서 runner/Airflow 선택을 Scheduling 안이 아니라 Process 다음 `Handoff/Run` 단계로 분리했다.
- Verified: backend focused tests 9 passed, frontend build 통과, contract JSON validation 통과, HTTP smoke 통과, browser smoke에서 draft 저장과 API 조회를 확인했다.
- Remaining: Airflow DAG trigger, local/spark runner 실행, Silver/Gold materialization, CatalogMetadata publish는 C-4 이후 범위다.
- Next context: C-4는 `target_dataset_drafts` record를 읽어 M5 run handoff를 만들고 `executor_handoff`에 따라 local_runner/Airflow/spark_runner 경계를 호출한다.
- Risk: 현재 저장되는 것은 metadata/job draft이며 실제 transform 실행 결과가 아니다.
