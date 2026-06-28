# M1 query route trace UI 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: draft, scope proposed
- Summary: M1 후속 Phase 7로 생성됐다. M6 `route`와 `retrieval_trace`를 `/query` 화면에 표시하는 UI 보강 Phase다.

## Recommended Next Action / 권장 다음 행동

- Phase 6 browser smoke 이후 진행한다.
- Reason: smoke 결과에서 현재 `/query` 표시 gap을 확인한 뒤 보강하면 범위가 작게 유지된다.

## Options / 선택지

1. Phase 6 완료 후 이 Phase를 구현한다.
2. Phase 6 없이 바로 route/trace 표시를 구현한다.
3. route/trace 표시를 readiness panel Phase에 흡수한다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

-

## Next AI Action / 다음 AI 행동

- option 1이면 `confirmations.md`를 업데이트하고 공유 contract를 초안 작성 또는 확인한다.
- option 2이면 `plan.md`와 `shared-docs.md`를 업데이트한다.
- option 3이면 `scripts/start-workflow.sh`로 다른 workspace를 만든다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
