# M2 Taxi 5GB local Spark evidence 노트

## 진행 메모

- 이전 `m2-taxi-scale-evidence`는 50MB급 January 2024 Taxi 파일과 10,000-row demo Spark smoke를 확인했다. 5GB급 Taxi Spark 실행은 이번 branch의 새 증거다.
- 사용자 제공 로컬 Taxi directory를 입력으로 사용했으며, Parquet 파일 84개, 처리 대상 bytes는 `4,871,531,583`이다.
- 첫 실행은 월별 Parquet schema drift 때문에 실패했다. 예: `passenger_count`가 어떤 파일에서는 double, 어떤 파일에서는 INT64로 들어왔다.
- 두 번째 실행은 JVM heap 부족으로 실패했다. local Spark 실행에서 driver memory를 `8g`로 올리고 Parquet vectorized reader를 꺼서 해결했다.
- 성공 실행은 `local[2]`, `driver_memory=8g`, `parquet_vectorized_reader=false` 조건에서 끝났다.

## 결정

- 이번 단계는 Docker Spark cluster를 먼저 만들지 않고 PySpark local mode로 5GB 처리 경로를 증명한다.
- Taxi 결과는 M2 Spark runtime scale 보조 증거이며, Week 2 대표 데모 경로는 여전히 `pipeline_product_health_e2e` / `gold_product_health`다.

## 열린 질문

- 같은 5GB 입력을 Docker Spark cluster에서 다시 실행할 때 memory/executor 설정을 어떤 기본값으로 둘지 후속 branch에서 결정해야 한다.
- MinIO/S3 호환 write는 local evidence 이후 후속으로 남아 있다.

## 링크 / 증거

- Summary: `data/results/m2_taxi_5gb_local_evidence/run_taxi_5gb_local_spark_001_summary.json` (gitignored)
- Gold output: `data/results/m2_taxi_spark_local_evidence/taxi/gold/daily_metrics/run_id=run_taxi_5gb_local_spark_001/gold_taxi_daily_metrics.parquet` (gitignored)
- Result: input `308,010,490 rows`, input `4,871,531,583 bytes`, output `2,608 rows`, output `225,057 bytes`, duration `107,366ms`.
