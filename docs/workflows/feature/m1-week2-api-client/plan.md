# M1 Week2 API Client 연결 계획

## 목표

M1 live UI의 첫 구현 Phase로, frontend에서 Week2 M5/M6 API를 호출할 수 있는 작은 client layer를 추가한다.

## 포함 범위

- `frontend/src/api/week2Api.js` 추가
- `triggerWeek2Run`, `getWeek2Run`, `getWeek2Catalog`, `askWeek2AiQuery` 구현
- Week2 기본 pipeline/dataset/executor 상수 export
- `frontend/src/api/asklakeClient.js`에서 새 client export

## 제외 범위

- 화면 대규모 개편
- run polling
- chart rendering
- M5 workflow service 변경
- M6 scoring 또는 SQL 로직 변경

## 완료 기준

- 네 API 함수가 모두 export된다.
- frontend build가 통과한다.
- strict harness validation이 통과한다.
