# Data navigation reframe 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: 좌측 메뉴를 `연결`, `데이터셋`, `작업`, `실행 기록`으로 재정리하고, 데이터셋은 Source/Silver/Gold 하위 메뉴, 작업은 Silver Transform/Gold Build 하위 메뉴로 분리했다.
- Verified: frontend build 통과, browser smoke에서 route/menu/empty state와 Target Dataset draft 기반 Silver/Gold/Job 파생 표시를 확인했고 smoke data를 정리했다.
- Remaining: C-4에서 Gold Build Job을 실제 Job Run handoff로 연결한다.
- Next context: `/jobs/gold-build`의 Gold Build Job이 C-4 실행 진입점이 된다. `/runs`는 C-4 결과를 표시할 빈 자리로 준비되어 있다.
- Risk: 현재 Jobs는 Target Dataset 정의에서 파생된 ready/planned 표시이며 실제 실행 기록이 아니다.
