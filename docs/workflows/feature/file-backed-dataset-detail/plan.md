# File-backed dataset detail 계획

## 목표

Source/Silver/Gold Dataset 목록과 상세에서 metadata-only 항목과 실제 local file-backed 항목을 구분하고, 실제 파일의 path/schema/bytes/row evidence를 보여준다.

## 진행 상태

- Status: completed
- Date: 2026-06-30
- 구현은 read-side file evidence helper와 Source/Silver/Gold detail 표시로 제한했다.

## 범위

- Source Dataset detail에 connection path와 파일 검사 evidence 표시.
- Silver Dataset detail에 prepared parquet path, bytes, schema preview 표시.
- Gold Dataset detail에 prepared gold parquet/catalog path, bytes, schema preview 표시.
- metadata-only 항목은 그대로 metadata-only로 표시.

## 제외 범위

- 실제 파일 삭제.
- cascade delete.
- row-level browser preview 대량 로딩.
- ETL 실행.

## 선행 조건

- Product Health prepared dataset 연결 또는 최소 local file inventory helper.
- 기존 Source/Silver/Gold 목록 관리 액션 유지.

## 구현 대상 파일 예상

- `backend/app/adapters/sqlite_metadata_store.py`
- `backend/app/domain/schemas.py`
- `backend/app/api/source_catalog.py`
- `frontend/src/app/App.jsx`
- focused tests

## API/contract 영향

- Dataset detail response에 optional `file_evidence` 또는 `storage_evidence`가 추가될 수 있다.
- 기존 metadata CRUD payload와 호환되어야 한다.

## UI 영향

- 목록 카드에 `file-backed` / `metadata-only` 표시.
- 상세 modal에 path, bytes, row count status, schema source 표시.
- 삭제 modal은 metadata-only 삭제임을 유지한다.

## Acceptance Criteria

- 실제 파일이 있는 Dataset detail은 path와 bytes를 보여준다.
- 파일이 사라진 Dataset detail은 missing 상태를 보여준다.
- metadata-only Dataset detail은 실제 파일이 있는 것처럼 표시하지 않는다.

## Regression / Failure Scenario

- 긴 path/ID가 카드 밖으로 넘치지 않는다.
- missing file이 있어도 목록 전체 로딩이 실패하지 않는다.

## Manual Verification

1. Source Dataset 상세를 연다.
2. Silver Dataset 상세를 연다.
3. Gold Dataset 상세를 연다.
4. file-backed badge와 metadata-only badge가 올바른지 확인한다.

## Data / Evidence 확인 항목

- `data/local_sources/product_health/silver/*.parquet`
- `data/local_sources/product_health/gold/gold_product_health.parquet`
- `data/raw/taxi/yellow_tripdata_2019_2025/*.parquet`

## Blocked Condition

- file evidence를 어떤 API에서 제공할지 결정되지 않았다.
- 기존 DB schema에 file evidence 저장이 필요한지, on-read scan으로 충분한지 결정되지 않았다.

## Report 기준

- `docs/reports/file-backed-dataset-detail.md`에 file-backed/metadata-only 표시 결과와 missing file 처리 결과를 기록한다.
