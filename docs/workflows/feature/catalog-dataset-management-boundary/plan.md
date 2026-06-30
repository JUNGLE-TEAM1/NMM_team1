# CatalogDataset management boundary 계획

## 목표

registered CatalogDataset 수정/삭제를 어디까지 허용할지 결정하고, metadata-only 관리와 실제 output file 삭제/cascade delete 경계를 정의한다.

## 상태

- 2026-06-30: 구현 완료. `/api/catalog/datasets/management-policy`와 `/datasets/gold` read-only boundary panel을 추가했다.

## 범위

- CatalogDataset edit/delete 옵션 분석.
- metadata-only update/delete API 설계 초안.
- 참조 차단 규칙 정의.
- UI에서 registered CatalogDataset은 현재 상세만 가능하다는 상태를 명확히 표시.

## 제외 범위

- 즉시 CatalogDataset update/delete 구현.
- 실제 parquet/jsonl/output file 삭제.
- cascade delete.
- 권한/approval workflow.

## 선행 조건

- C-6 CatalogMetadata integration.
- C-13 Dataset management actions.

## 구현 대상 파일 예상

- `docs/03-interface-reference.md` 후속 Phase에서 필요 시 갱신.
- `backend/app/ports/metadata_store.py`
- `backend/app/adapters/sqlite_metadata_store.py`
- `frontend/src/app/App.jsx`

## API/contract 영향

- CatalogDataset update/delete API가 필요할 수 있다.
- `CatalogMetadata.storage`와 실제 파일 삭제 여부는 별도 decision으로 둔다.

## UI 영향

- Catalog/Gold 목록에서 registered item 관리 범위가 명확해진다.
- 삭제 버튼을 열기 전에 metadata-only 삭제인지 actual file delete인지 구분한다.

## Acceptance Criteria

- registered CatalogDataset 관리 정책이 문서화된다.
- metadata-only와 actual file delete가 섞이지 않는다.
- 구현 Phase로 넘어갈 때 API/rollback/blocked rule이 명확하다.

## Regression / Failure Scenario

- CatalogDataset 삭제가 AI Query readiness를 조용히 깨뜨리지 않는다.
- output file은 사용자 확인 없이 삭제하지 않는다.

## Manual Verification

1. 현재 registered CatalogDataset 표시를 확인한다.
2. 수정/삭제 미지원 안내가 명확한지 확인한다.
3. 후속 구현 결정이 필요한 항목을 decisions에 기록한다.

## Data / Evidence 확인 항목

- `data/local_sources/product_health/catalog/dataset_product_health_gold.json`
- `data/week2/_metadata/catalog`
- SQLite `catalog_datasets`

## Blocked Condition

- 실제 파일 삭제를 원하는지 metadata-only 삭제를 원하는지 결정되지 않았다.
- AI Query가 참조 중인 catalog 삭제 정책이 없다.

## Report 기준

- `docs/reports/catalog-dataset-management-boundary.md`에 결정/미결정 항목과 후속 구현 범위를 기록한다.
