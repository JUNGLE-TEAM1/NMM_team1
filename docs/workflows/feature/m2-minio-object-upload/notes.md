# M2 MinIO 실제 업로드 smoke 노트

## 진행 메모

- 2026-06-27: issue #188, branch `feature/m2-minio-object-upload`, workspace를 생성했다.
- 최신 `main` `01a91b7` 기준으로 시작했다.
- 기존 `Week2StorageAdapter`는 path 계산까지만 했고, 이번 branch에서 local fallback file을 MinIO/S3-compatible endpoint에 `PUT`하는 opt-in smoke를 추가했다.
- 실제 MinIO container smoke에서 `backend/samples/amazon_reviews_demo.jsonl` 4 rows를 Parquet로 만들고 `s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_minio_001/dataset_reviews_gold.parquet` object upload까지 성공했다.

## 결정

- 새 SDK를 추가하지 않고 기존 dependency인 `httpx`와 내부 AWS SigV4 signing helper를 사용한다.
- upload는 기본 동작이 아니라 `RuntimeConfig.options.upload_to_object_storage=true`일 때만 수행한다.
- credential 값은 commit하지 않고 `ASKLAKE_DEMO_MINIO_ACCESS_KEY`, `ASKLAKE_DEMO_MINIO_SECRET_KEY` 환경 변수 이름만 계약에 남긴다.
- local MinIO smoke endpoint는 `http://localhost:9000`을 fixture 기본값으로 둔다. 실제 smoke에서는 포트 충돌을 피하려고 `http://localhost:19000`을 사용했다.

## 열린 질문

- AWS S3 production profile, IAM/region/credential source는 아직 결정하지 않는다.
- MinIO를 기본 docker compose service로 추가할지는 후속 Phase에서 결정한다.
- M5 Airflow DAG 내부에서 이 upload 옵션을 언제 켤지는 M5 runner selection/Airflow 통합 Phase에서 결정한다.

## 링크 / 증거

- Issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/188
- Actual MinIO smoke summary: `data/results/m2_minio_upload_smoke/summary.json` (gitignored)
- Local output: `data/week2/reviews/gold/run_id=run_reviews_demo_minio_001/dataset_reviews_gold.parquet` (gitignored)
