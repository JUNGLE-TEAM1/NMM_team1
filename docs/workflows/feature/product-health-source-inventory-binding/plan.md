# Product Health Source Inventory Binding 계획

## 목표

이미 준비된 Product Health 복합 데이터셋 원천을 Source Dataset 생성 흐름에 묶는다. 사용자는 원천이 실제 raw file인지, prepared dataset/reference인지, 아직 누락된 파일인지 구분해서 볼 수 있어야 한다.

## 범위

- Product Health 원천 inventory를 정리한다.
  - behavior events
  - reviews/VOC
  - product catalog / MEP product metadata
  - delivery 또는 taxi evidence
- Source Dataset 후보 카드에서 `raw_file`, `prepared_dataset`, `missing`, `mismatch` 상태를 구분한다.
- 각 후보는 local path, expected role, evidence bytes/row status, canonical Source Dataset name을 가진다.
- Source Dataset 생성 wizard가 Product Health 후보를 선택하면 이름/raw_scope/schema preview를 추천한다.

## 제외 범위

- 새 데이터셋 다운로드.
- full 5GB Source ingest.
- Spark/Airflow 실행.
- Silver/Gold materialization.
- Catalog publish 또는 AI Query 실행.

## Acceptance Criteria

- Product Health 원천 4종이 Source Dataset 후보로 보인다.
- prepared dataset과 실제 raw file이 UI에서 구분된다.
- missing/mismatch 원천은 성공처럼 표시되지 않는다.
- Source Dataset 저장 결과가 후속 Silver 생성 입력으로 사용할 수 있는 metadata를 남긴다.

## Regression / Failure Scenario

- prepared Gold 또는 synthetic output을 raw source처럼 표시하면 실패다.
- missing raw file을 ready로 표시하면 실패다.
- Product Health 후보 선택이 기존 일반 External Connection 선택 흐름을 깨면 실패다.

## Manual Verification

1. `/datasets/source` 또는 Source Dataset 생성 wizard를 연다.
2. Product Health 원천 후보가 표시되는지 확인한다.
3. 각 후보의 type/status/path/evidence label을 확인한다.
4. 하나 이상의 후보를 Source Dataset으로 저장하고 목록/상세에서 metadata를 확인한다.
