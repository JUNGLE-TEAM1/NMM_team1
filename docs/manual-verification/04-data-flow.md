# 04. Data Flow

## 목적

data creation, transformation, persistence, retrieval, export를 확인한다.

## 사전 조건

- data store 또는 file location이 준비되어 있다.
- test input이 준비되어 있다.
- expected output이 확인되어 있다.

## 절차

1. test data를 생성하거나 import한다.
2. process 또는 action을 trigger한다.
3. result location에서 결과를 조회하거나 inspect한다.
4. data shape, state, ownership을 확인한다.

## 기대 결과

- data가 기대한 shape로 저장되거나 출력된다.
- invalid data가 거부되거나 처리된다.
- unrelated data가 수정되지 않는다.

## 실패 시

- schema/interface mismatch를 확인한다.
- migration/data initialization을 확인한다.
- ownership 또는 transaction boundary를 확인한다.

## 증거

- input data
- output data
- query/log/screenshot
