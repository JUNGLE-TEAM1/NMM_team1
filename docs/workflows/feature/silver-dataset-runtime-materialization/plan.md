# Silver dataset runtime materialization 계획

## 목표

Source Dataset에서 Silver Dataset을 만들 때 실제 변환 실행 가능 범위를 명확히 하고, local file 기반 Silver materialization부터 검증한다.

## 상태

- 2026-06-30: 계획 생성. Silver Dataset metadata 생성은 있지만 runtime materialization과 connector별 지원 범위는 더 정리해야 한다.
- 2026-06-30: 구현 완료. Silver Dataset 상세에서 수동 `Silver output 생성` 액션을 추가했고 local parquet output evidence를 저장한다.

## 범위

- Source Dataset -> Silver Dataset 변환 실행 경로 정리.
- local file/folder 기반 standardize/validate materialization.
- output path, row count, bytes, failed/quarantine summary 기록.
- Spark cluster 실행 가능 여부는 별도 capability로 표시하되 기본 실행은 local smoke로 제한.

## 제외 범위

- Kafka streaming consume.
- DB/S3 대용량 read.
- Spark distributed job을 기본 버튼으로 실행.
- Gold Dataset 생성 변경.

## 선행 조건

- Source Dataset runtime discovery.
- local file-backed evidence.
- Silver Dataset persistence.

## 구현 대상 파일 예상

- `backend/app/services/target_dataset_local_runner.py`
- `backend/app/services/week2_spark_runner.py`
- `backend/app/api/source_catalog.py`
- `frontend/src/app/App.jsx`
- backend tests for Silver materialization evidence

## Acceptance Criteria

- [x] local Source Dataset에서 Silver output이 실제 파일로 생성된다.
- [x] Silver Dataset detail에 output path/row count/bytes/schema가 보인다.
- [x] unsupported connector는 Source Snapshot 선행 필요 오류로 차단한다.
- [x] 실패한 변환은 성공처럼 저장되지 않는다.

## Regression / Failure Scenario

- metadata-only Silver가 file-backed로 보이면 실패다.
- Source Dataset 없이 Silver를 만들 수 있으면 실패다.
- Spark cluster가 실행되지 않았는데 distributed success로 표시하면 실패다.

## Manual Verification

1. local Source Dataset을 선택한다.
2. Silver Dataset 변환 rule을 설정한다.
3. 실행 후 output file evidence를 확인한다.
4. unsupported connector 상태를 확인한다.

## Report 기준

- `docs/reports/silver-dataset-runtime-materialization.md`에 output evidence와 connector support matrix를 기록한다.
