# 05. Integration

## 목적

internal 또는 external integration을 확인한다.

## 사전 조건

- integration config가 준비되어 있다.
- test endpoint/tool/provider 또는 mock이 준비되어 있다.
- timeout/fallback expectation이 문서화되어 있다.

## 절차

1. dependency를 시작하거나 mock을 활성화한다.
2. integration action을 trigger한다.
3. success output을 확인한다.
4. 안전하다면 dependency failure를 simulate한다.
5. fallback/error handling을 확인한다.

## 기대 결과

- happy path에서 integration이 성공한다.
- failure가 격리되고 visible하다.
- fallback 또는 retry behavior가 문서와 맞다.

## 실패 시

- secret을 노출하지 않고 credential/config를 확인한다.
- timeout/retry/logging을 확인한다.
- request/response contract를 확인한다.

## 증거

- input
- provider/dependency status
- output/fallback message
