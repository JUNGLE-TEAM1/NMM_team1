# M2 MinIO S3-compatible storage adapter 노트

## 진행 메모

- M2 storage adapter는 실제 MinIO upload가 아니라 `s3_uri`와 local fallback path를 같은 prefix에서 계산하는 adapter다.
- manual smoke에서 `s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/`와 `/tmp/asklake_m2_storage_adapter_smoke/reviews/gold/run_id=run_reviews_demo_001/dataset_reviews_gold.parquet`가 같은 prefix를 공유하고 파일이 존재함을 확인했다.

## 결정

- 데이터 품질 판단은 M3 TransformSpec/quality rule 책임이므로 이번 PR에 포함하지 않는다.
- 실제 MinIO endpoint/bucket/object upload는 후속 Phase로 분리한다.

## 열린 질문

- 실제 MinIO endpoint, bucket lifecycle, credential 방식은 아직 미정이다.

## 링크 / 증거

- Issue #171: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/171
