# Deep browser runtime E2E 계획

## 목표

브라우저에서 External Connection 생성부터 AI Query까지 데모 전체 흐름을 처음부터 끝까지 클릭 검수하고, UI/API mismatch와 남은 gap을 정리한다.

## 상태

- 2026-06-30: 계획 생성. `/connections`는 browser smoke를 통과했으나 전체 흐름 deep E2E는 아직 수행하지 않았다.

## 범위

- External Connection 생성 또는 선택.
- Source Dataset 생성.
- Silver Dataset 생성.
- Gold Dataset 생성.
- Job 실행.
- Run 확인.
- Catalog 등록.
- AI Query 질의.
- 콘솔 에러, 화면 깨짐, 버튼 위치, 저장 후 복귀 흐름 확인.

## 제외 범위

- 새 기능 구현.
- 대용량 운영 ETL.
- cloud resource 생성.
- destructive delete/cascade 검증.

## 선행 조건

- Catalog AI Query runtime E2E.
- Jobs/Runs runtime integration.
- frontend/backend 검수용 실행 방법 확정.

## 구현 대상 파일 예상

- `docs/reports/deep-browser-runtime-e2e.md`
- 필요 시 `docs/07-manual-verification-playbook.md`
- 필요 시 Hotfix Phase 문서

## Acceptance Criteria

- 브라우저에서 전체 데모 시나리오가 끊기지 않고 진행된다.
- 각 저장 후 해당 목록 화면으로 복귀한다.
- 실제 지원하지 않는 기능은 disabled/blocked로 명확히 보인다.
- console error가 없다.
- 남은 문제는 Hotfix 또는 후속 Phase로 분류된다.

## Regression / Failure Scenario

- mock/preset 데이터가 실제 연결처럼 보이면 실패다.
- 저장 후 사용자가 현재 위치를 잃으면 실패다.
- UI가 API 상태와 다르게 성공을 표시하면 실패다.

## Manual Verification

1. frontend/backend/runtime을 모두 실행한다.
2. `/connections`에서 시작한다.
3. Source/Silver/Gold/Jobs/Runs/Catalog/AI Query를 순서대로 클릭한다.
4. 화면과 API 상태가 일치하는지 기록한다.

## Report 기준

- `docs/reports/deep-browser-runtime-e2e.md`에 시나리오 결과, 실패 지점, screenshot 필요 여부, 다음 Hotfix 후보를 기록한다.
