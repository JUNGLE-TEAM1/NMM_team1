# M2 Taxi local batch evidence 노트

## 진행 메모

- 2026-06-27: issue #168, branch `feature/m2-taxi-local-batch-evidence`, workspace를 생성했다.
- 이번 PR은 Taxi local batch evidence에 집중한다. PostgreSQL loader, MinIO/S3, PySpark, Airflow DAG 내부 호출은 후속 PR로 분리한다.
- `Week2TaxiBatchRunner`는 TLC Taxi monthly Parquet을 읽어 `gold_taxi_daily_metrics.parquet`을 만든다.
- full-month local evidence에서 `yellow_tripdata_2024-01.parquet` 전체 2,964,624 rows를 처리했고, Gold output은 35 pickup dates가 나왔다.
- 35 dates는 1월 31일만 나온 것이 아니라 source 파일 안에 2002, 2009, 2023 같은 outlier pickup timestamp가 포함되어 있기 때문이다. 이번 PR에서는 이를 제거하지 않고 `invalid_trip_count`와 후속 품질 결정 대상으로 둔다.

## 결정

- `gold_taxi_daily_metrics` schema는 `docs/03-interface-reference.md`에 최소 계약으로 남긴다.
- local full-month evidence output과 summary JSON은 `data/` 아래에 두며 commit하지 않는다.

## 열린 질문

- 다음 PR에서 먼저 할 것은 MinIO/S3 storage adapter인지, PySpark local mode 전환인지, PostgreSQL loader인지 결정해야 한다.
- outlier pickup date를 Gold output에서 제외할지, 품질 metric으로만 노출할지는 후속 품질 결정이 필요하다.

## 링크 / 증거

- Issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/168
- Local source file: `/Users/liamtsy/Downloads/yellow_tripdata_2024-01.parquet`
- Fixed evidence summary: `data/results/m2_taxi_local_batch_evidence/run_taxi_2024_01_fixed_001_summary.json` (gitignored)
- Full-month evidence summary: `data/results/m2_taxi_local_batch_evidence/run_taxi_2024_01_full_month_001_summary.json` (gitignored)
