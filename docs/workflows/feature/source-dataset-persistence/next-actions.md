# Source dataset persistence 다음 행동 메뉴

1. Recommended: PR을 열고 CI 확인 후 C-3 `feature/target-dataset-job-draft`로 넘어간다.
2. Alternative: Source Dataset metadata를 `CatalogDataset`과 합치는 결정이 생기면 Decision Option Brief를 먼저 작성한다.
3. Stop: ingest 실행, file upload, Kafka consume 요구가 생기면 C-4/C-5와 분리 여부를 결정한다.
