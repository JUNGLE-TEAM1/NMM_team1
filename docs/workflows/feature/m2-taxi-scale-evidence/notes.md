# M2 Taxi scale evidence 노트

## 진행 메모

- 2026-06-27: issue #201, branch `feature/m2-taxi-scale-evidence`, workspace를 생성했다.
- TLC 공식 CloudFront/S3 직접 다운로드는 현재 CLI 환경에서 `403`으로 차단되어 약 5GB 원본 자동 다운로드는 완료하지 못했다.
- `.venv`에 `pyspark==4.1.2`를 설치했고, Spark local mode `local[1]` smoke가 성공했다.
- `Week2TaxiSparkRunner`를 추가해 작은 Taxi Parquet 입력에서 Spark read -> Taxi daily Gold metric aggregate -> Parquet write까지 확인했다.
- 임시 MinIO 컨테이너를 `http://localhost:19000`에 띄워 Spark local output을 existing `Week2StorageAdapter`로 upload하는 smoke까지 성공했다.

## 결정

- 이번 PR은 Docker Spark cluster 완성이 아니라 PySpark local mode 처리 경로 검증으로 닫는다.
- Spark direct `s3a://` write는 이번 범위에서 완성하지 않고, Spark local write 후 existing storage adapter upload로 MinIO/S3-compatible smoke를 확인한다.
- Docker Spark cluster는 M2 최종 완료 기준에 필요하므로 후속 작업으로 남긴다.
- 5GB scale evidence는 팀원이 월별 `yellow_tripdata` Parquet 묶음을 로컬 ignored 경로에 준비하면 같은 Spark CLI에 input만 바꿔 재실행한다.

## 열린 질문

- Docker Spark cluster를 docker compose에 포함할지, 별도 smoke script로 둘지 후속 이슈에서 결정해야 한다.
- Spark direct `s3a://` write를 채택할 경우 Hadoop AWS jar/version과 MinIO endpoint 설정을 별도 검증해야 한다.
- 5GB Taxi 묶음의 정확한 연도/월 범위는 데이터 준비자가 확정해야 한다.

## 링크 / 증거

- Spark local demo summary: `data/results/m2_taxi_spark_local_evidence/run_taxi_spark_local_demo_001_summary.json` (gitignored)
- Spark local + MinIO upload summary: `data/results/m2_taxi_spark_local_evidence/run_taxi_spark_local_minio_001_summary.json` (gitignored)
- Existing local full-month pyarrow summary: `data/results/m2_taxi_scale_evidence/run_taxi_2024_01_full_month_scale_smoke_001_summary.json` (gitignored)
