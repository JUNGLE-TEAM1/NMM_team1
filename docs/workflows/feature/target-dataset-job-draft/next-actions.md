# Target Dataset job draft 다음 행동

1. C-4 `target-dataset-run-handoff`에서 저장된 draft를 선택/조회해 run 생성으로 넘긴다.
2. `executor_handoff=airflow`일 때 Airflow가 떠 있지 않으면 fallback 또는 미실행 상태를 명확히 표시한다.
3. run 결과는 C-5 runtime evidence와 C-6 CatalogMetadata로 이어진다.
