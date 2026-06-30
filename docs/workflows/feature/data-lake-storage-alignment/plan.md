# C-28A Data Lake Storage Alignment 계획

## 목표

- Source Snapshot, Silver materialization, Gold runtime output의 실제 local artifact 경로를 `data/lake/bronze|silver|gold`로 정렬한다.
- UI와 API가 말하는 Data Lake 저장 위치가 실제 파일 위치와 어긋나지 않게 한다.

## 범위

- Source Snapshot 기본 출력: `data/lake/bronze/source_snapshots/<source_dataset>/...jsonl`
- Silver Dataset materialization 기본 출력: `data/lake/silver/<silver_dataset>.parquet`
- Gold Dataset local runner 출력: `data/lake/gold/run_id=<run_id>/<gold_output>.parquet`
- 기존 prepared Product Health parquet는 읽기 fallback으로 유지한다.
- MinIO/S3 upload는 이번 Phase에서 수행하지 않고 `object_storage.status=not_uploaded`로 분리한다.

## 제외

- Airflow DAG trigger
- Spark distributed runner
- MinIO/S3 실제 upload
- Catalog publish 자동화
- 기존 prepared 샘플 파일 이동/삭제

## 완료 기준

- Source/Silver/Gold runtime API 응답의 output path가 `data/lake` 경로를 가리킨다.
- 파일이 실제로 해당 경로에 생성된다.
- 관련 backend 테스트와 frontend build가 통과한다.
