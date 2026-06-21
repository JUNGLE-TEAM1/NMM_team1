# 06. Failure Scenarios

## 목적

대표 실패가 system crash나 misleading success를 만들지 않는지 확인한다.

## 사전 조건

- 관련 `docs/06-regression-and-failure-scenarios.md` section을 식별했다.
- 안전한 failure reproduction method가 있다.

## 절차

1. failure condition을 재현한다.
2. user-visible behavior를 관찰한다.
3. log/status/reporting을 관찰한다.
4. normal state로 복구한다.

## 기대 결과

- failure가 명확하고 actionable하다.
- system이 recoverable하다.
- unsupported success state가 표시되지 않는다.

## 실패 시

- Failure Scenario를 추가하거나 업데이트한다.
- Hotfix candidate를 만든다.
- Phase report에 기록한다.

## 증거

- failure condition
- expected vs actual behavior
- log/screenshot
- follow-up action
