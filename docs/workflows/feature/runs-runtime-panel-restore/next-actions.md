# Runs runtime panel restore 다음 액션

> Superseded: 다음 행동은 이 workspace가 아니라 `feature/runtime-status-surface-decision`과 C-25 이후 runtime connector 흐름에서 결정한다.

1. C-25 `feature/external-connection-runtime-checks`
   - PostgreSQL/MongoDB/S3/Kafka connection test API를 secret-ref 경계로 구현한다.
2. C-26 `feature/source-dataset-runtime-discovery`
   - Source Dataset 생성 단계에서 실제 connection discovery 결과를 사용한다.
3. C-31 `feature/deep-browser-runtime-e2e`
   - runtime panel 포함 전체 E2E를 브라우저로 검수한다.
