# Full Browser Demo Smoke 계획

## 목표

브라우저에서 실제로 클릭하면서 `연결 -> Source -> Silver -> Gold -> Run -> Catalog -> AI Query` 전체 흐름이 데모 가능한지 검수한다. 구현 Phase가 아니라 마지막 gap 분류와 Hotfix 후보 선별 Phase다.

## 범위

- in-app browser 또는 Playwright로 전체 클릭 흐름을 검수한다.
- console error, UI 깨짐, 버튼/단계 불일치, 오래된 mock/seed 문구를 기록한다.
- Product Health prepared/live 경로가 섞이는지 확인한다.
- 발견한 문제는 Hotfix 또는 후속 Phase로 분류한다.

## 제외 범위

- 대규모 UI 재설계.
- full ingest runner 구현.
- Spark/Airflow 운영 실행.
- Catalog/AI Query 새 기능 추가.

## Acceptance Criteria

- 전체 흐름이 console error 없이 진행된다.
- 각 단계의 화면 문구가 실제 동작 범위와 일치한다.
- mock/seed/fake처럼 보이는 표현이 데모 핵심 화면에 남아 있지 않거나 gap으로 분류된다.
- 남은 문제는 severity와 수정 Phase가 정리된다.

## Regression / Failure Scenario

- 브라우저에서는 성공처럼 보이지만 실제 API/run/catalog/query evidence가 없으면 실패다.
- 버튼이 다음 단계로 이동하지만 저장된 데이터가 없으면 실패다.
- UI가 좁아지거나 카드가 깨져 데모 설명이 어려우면 Hotfix 후보로 기록한다.

## Manual Verification

1. 최신 backend/frontend를 실행한다.
2. `/connections`에서 Product Health 관련 연결 또는 source 후보를 확인한다.
3. Source Dataset을 저장한다.
4. Silver Dataset을 저장한다.
5. Gold Dataset을 저장한다.
6. Run을 만들고 실행한다.
7. Catalog에 등록한다.
8. AI Query에서 Product Health 질문을 실행한다.
9. console errors, screenshot, run/catalog/query evidence를 기록한다.
