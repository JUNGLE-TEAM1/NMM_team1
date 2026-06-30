# Target Dataset job draft 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Target Dataset / ETL job draft 저장 API와 UI 저장 버튼을 추가했다.
- Follow-up change: runner/Airflow 선택을 Process 다음 `Handoff/Run` 단계로 분리해 Scheduling과 실행 handoff 의미를 분리했다.
- Verified: backend focused tests 9 passed, frontend build, contract JSON validation, HTTP smoke, browser smoke 통과.
- Remaining: Airflow DAG trigger, runner execution, Silver/Gold materialization, CatalogMetadata publish.
- Next context: C-4에서 `target_dataset_drafts` record를 M5 run handoff로 넘긴다.
- Risk: draft 저장은 실행 성공이 아니다.
