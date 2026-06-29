# Data integration source step 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: B-2 complete locally
- Summary: Source 시작 모달, demo-safe source 선택, Source 카드 상태 반영, schema preview chip 표시가 완료되었다.

## Recommended Next Action / 권장 다음 행동

- B-3 `feature/data-integration-transform-step`을 시작하기 전에 현재 Source 선택 흐름을 사람이 확인한다.
- Reason: 다음 Phase부터 선택된 source의 컬럼을 Transform step에서 다루기 시작한다.

## Options / 선택지

1. 현재 `/dataset` Source 선택 흐름을 확인하고 B-3로 진행한다.
2. B-2 modal/copy/source placeholder를 조금 더 조정한다.
3. 실제 source API 연결을 별도 Phase로 먼저 분리한다.
4. 여기서 보류한다.

## Waiting On Human / 사람 응답 대기

- 다음 Phase 진행 여부 또는 B-2 추가 수정 여부.

## Last User Choice / 마지막 사용자 선택

- B-2 진행 지시

## Next AI Action / 다음 AI 행동

- option 1이면 `docs/workflows/feature/data-integration-transform-step/plan.md` 기준으로 B-3를 시작한다.
- option 2이면 B-2 branch에서 `frontend/src/app/App.jsx`/`styles.css` copy/layout을 조정하고 재검증한다.
- option 3이면 source API 연결 Phase를 새로 만들거나 `plan.md` 범위를 재조정한다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
