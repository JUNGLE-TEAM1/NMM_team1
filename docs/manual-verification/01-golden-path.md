# 01. Golden Path

## 목적

가장 중요한 end-to-end 성공 경로를 확인한다.

## 사전 조건

- environment setup이 완료되어 있다.
- test user/input/data가 준비되어 있다.
- 현재 acceptance scenario가 확인되어 있다.

## 절차

1. `README.md`에서 시작한다.
2. `AGENTS.md`와 `docs/08-development-workflow.md`를 읽는다.
3. `docs/00-layer-map.md`가 Source of Truth routing을 식별하는지 확인한다.
4. `AGENTS.md`가 agent operating rule을 설명하는지 확인한다.
5. `docs/08-development-workflow.md`가 Phase 실행과 report 요구사항을 정의하는지 확인한다.

## 기대 결과

- flow가 blocking error 없이 완료된다.
- 사람에게 보이는 feedback이 명확하다.
- 최종 state/output이 기대와 맞다.

## 실패 시

- 실패한 step을 식별한다.
- log/error를 캡처한다.
- 관련 Failure Scenario에 연결한다.

## 증거

- 완료한 step
- screenshot/log/output
- 남은 위험
