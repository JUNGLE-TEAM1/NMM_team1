# Silver dataset runtime materialization next actions

## 바로 다음

- C-28 `feature/gold-dataset-runtime-materialization` 진행.
- materialized Silver parquet를 입력으로 Gold output을 생성한다.

## 보류

- Spark distributed transform execution.
- connector direct read 기반 Silver materialization.
- failed/quarantine rows 별도 파일 저장과 rule engine 고도화.
