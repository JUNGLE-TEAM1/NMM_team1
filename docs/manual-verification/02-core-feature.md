# 02. Core Feature

## 목적

현재 Phase의 main feature를 확인한다.

## 사전 조건

- feature가 구현되어 있다.
- 필요한 data/input이 있다.
- 관련 interface contract가 확인되어 있다.

## 절차

1. feature entrypoint를 열거나 호출한다.
2. valid input을 제공한다.
3. expected state 또는 output을 확인한다.
4. 중요한 edge case를 하나 이상 시도한다.

## 기대 결과

- main behavior가 동작한다.
- edge case가 처리된다.
- output이 `docs/03-interface-reference.md`와 일치한다.

## 실패 시

- interface mismatch를 확인한다.
- validation/state handling을 확인한다.
- 관련 log를 확인한다.

## 증거

- input
- output
- screenshot/log
