# M2 Spark direct s3a write smoke 노트

## 진행 메모

- 기존 `minio-small`은 Spark가 먼저 local fallback Parquet 파일을 만들고, M2 `Week2StorageAdapter`가 그 파일을 MinIO object로 PUT하는 방식이다.
- 이번 `direct-s3a-small`은 Spark writer가 output path를 처음부터 `s3a://asklake-demo/...`로 보고 직접 Parquet directory를 쓴다.
- 공개 Spark image `apache/spark:4.0.1`에는 `hadoop-aws` jar가 없어서 `spark-submit --packages org.apache.hadoop:hadoop-aws:3.4.1,software.amazon.awssdk:bundle:2.24.6`가 필요했다.
- 작은 Taxi smoke는 성공했고, summary shape는 기존 M2 evidence와 호환되도록 `status`, `task_results`, `row_count`, `bytes`, `duration_ms`, `output_path`, `output_row_count`, `output_bytes`를 유지했다.

## 결정

- direct S3A write와 adapter upload는 한 실행에서 섞지 않는다.
- direct S3A output은 단일 file path가 아니라 Spark 표준 Parquet directory prefix로 남긴다.
- 5GB direct S3A와 real AWS S3/IAM은 후속 evidence로 둔다.

## 열린 질문

- 반복 실행 시간을 줄이기 위해 Hadoop AWS jar를 custom Spark image에 bake-in 할지 결정해야 한다.
- Product Health 5GB input/spec이 준비되면 Taxi direct S3A와 같은 output 설정을 적용할 수 있는지 확인해야 한다.
- real AWS S3로 갈 때 bucket, region, IAM 권한, credential 주입 방식을 팀에서 정해야 한다.

## 링크 / 증거

- Issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/281
- Local summary: `data/results/m2_taxi_spark_docker_evidence/run_taxi_docker_spark_direct_s3a_small_001_summary.json`
- Report: `docs/reports/m2-spark-direct-s3a-write-smoke.md`
