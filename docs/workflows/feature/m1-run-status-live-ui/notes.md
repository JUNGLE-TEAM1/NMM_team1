# M1 Run Status Live UI notes

## 작업 메모

- `/runs` 내부 route는 외부 URL `/etl`로 매핑된다.
- Phase 1에서 만든 `frontend/src/api/week2Api.js` client를 재사용했다.
- local backend가 실행되지 않은 환경에서도 기본 화면은 렌더링되어야 한다.
- browser automation에서 기본 렌더링은 확인했으나 클릭 이벤트 자동 검증은 안정적으로 재현되지 않아 수동 smoke 후보로 남긴다.

## 변경 요약

- `RunStatusPage`에 Week2 live run panel을 추가했다.
- 실행 결과 view model은 별도 전역 상태 없이 page-local state로 유지한다.
- 기존 placeholder run table은 유지하고, live run이 있으면 상단 row로 끼워 넣는다.

