# Source dataset detail/manage 계획

## 목표

Source Dataset 목록에서 상세 정보 확인, 수정, 삭제가 가능하게 하여 연결 후 생성된 데이터셋을 관리할 수 있게 만든다.

## 문제 정의

- 현재 Source Dataset은 목록만 보이고 상세 정보를 확인하기 어렵다.
- 수정/삭제 action이 없어 잘못 만든 Source Dataset을 정리할 수 없다.
- 연결된 External Connection, raw scope, schema preview, metadata를 한 곳에서 확인해야 한다.

## 범위

- Source Dataset detail view 또는 modal
- Source Dataset edit action
- Source Dataset delete action
- connection id/name/type, raw scope, resource label, schema preview, status, created/updated 표시
- 삭제 전 확인 UI

## 제외

- 실제 raw file ingest
- 연결 테스트
- Silver Dataset 생성
- Gold wizard 입력 변경
- 대량 bulk delete

## 완료 기준

- Source Dataset 목록 카드에서 상세 확인으로 이동하거나 modal을 연다.
- 상세 화면에서 connection/raw/schema metadata가 보인다.
- 수정 후 목록과 상세 정보가 갱신된다.
- 삭제 후 목록에서 사라지고 downstream draft 영향은 안전하게 안내된다.
