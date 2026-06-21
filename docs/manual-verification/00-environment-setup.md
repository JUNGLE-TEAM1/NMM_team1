# 00. Environment Setup

## 목적

local 또는 target 검증 환경이 준비되었는지 확인한다.

## 사전 조건

- 필요한 도구가 설치되어 있다.
- 필요한 env example 또는 설정 안내가 있다.
- 실제 secret이 commit되어 있지 않다.

## 절차

1. setup command가 있다면 실행한다.
2. migration 또는 init command가 필요하면 실행한다.
3. service 또는 app을 시작한다.
4. health/smoke target을 확인한다.

## 기대 결과

- 필요한 service가 시작된다.
- health/smoke target이 응답한다.
- log에 blocking error가 없다.

## 실패 시

- env 값을 확인한다.
- port/process 충돌을 확인한다.
- dependency 설치 상태를 확인한다.
- migration/data 초기화 상태를 확인한다.

## 증거

- 실행한 명령
- 결과
- 필요한 경우 log/screenshot
