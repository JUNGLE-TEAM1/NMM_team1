# Dataset management actions 계획

## 목표

Connection, Silver Dataset, Gold Dataset 목록의 관리 액션을 Source Dataset 수준으로 맞추고, Jobs 화면의 `Dataset 편집`이 해당 dataset 수정 flow를 바로 열게 한다.

## 문제 정의

- External Connection, Silver Dataset, Gold Dataset 목록에는 상세/수정/삭제가 없다.
- Source Dataset만 관리 modal이 있어 데이터셋 계층별 관리 수준이 불균형하다.
- Jobs 화면의 `Dataset 편집`은 목록으로만 이동해 사용자가 다시 항목을 찾아야 한다.

## 범위

- External Connection 상세/수정/삭제 UI와 API
- Silver Dataset 상세/수정/삭제 UI와 API
- planned Gold/Target Dataset draft 상세/수정/삭제 UI와 API
- Jobs -> Dataset 편집 직접 진입
- 참조 중인 metadata 삭제 차단

## 제외

- 실제 row/file/object storage 삭제
- registered CatalogDataset 수정/삭제
- cascade delete
- Airflow/Spark/local runner job 삭제
- 권한/approval workflow
- 대규모 라우팅 개편

## 완료 기준

- Connection/Silver/Gold 목록에 상세/수정/삭제 액션이 보인다.
- 수정 후 목록에 변경 사항이 반영된다.
- 참조 중인 Connection/Silver/Target draft 삭제는 `409` 또는 UI 안내로 차단된다.
- registered Gold CatalogDataset은 상세만 가능하다.
- Jobs의 `Dataset 편집`은 해당 Silver/Gold 수정 modal을 바로 연다.
