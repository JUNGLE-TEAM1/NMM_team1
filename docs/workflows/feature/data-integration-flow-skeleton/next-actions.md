# Data integration flow skeleton 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: B-1 complete locally
- Summary: 데이터 통합 화면에 `Source -> Transform -> Target -> Run` 4단계 skeleton이 추가되었고 로컬 검증이 완료되었다.

## Recommended Next Action / 권장 다음 행동

- B-2 `feature/data-integration-source-step`을 시작하기 전에 현재 skeleton 화면을 사람이 확인한다.
- Reason: 다음 Phase부터 실제 source 선택 상태가 붙기 때문에 skeleton 방향 확인이 먼저다.

## Options / 선택지

1. 현재 `/dataset` skeleton 화면을 확인하고 B-2로 진행한다.
2. B-1 카드 copy/레이아웃을 조금 더 조정한다.
3. PR-ready sync/strict validation/PR 준비를 먼저 한다.
4. 여기서 보류한다.

## Waiting On Human / 사람 응답 대기

- 다음 Phase 진행 여부 또는 B-1 추가 수정 여부.

## Last User Choice / 마지막 사용자 선택

- B-1 진행 지시

## Next AI Action / 다음 AI 행동

- option 1이면 `docs/workflows/feature/data-integration-source-step/plan.md` 기준으로 B-2를 시작한다.
- option 2이면 B-1 branch에서 `frontend/src/app/App.jsx`/`styles.css` copy/layout을 조정하고 재검증한다.
- option 3이면 Git Sync Confirm 후 PR-ready 절차로 이동한다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
