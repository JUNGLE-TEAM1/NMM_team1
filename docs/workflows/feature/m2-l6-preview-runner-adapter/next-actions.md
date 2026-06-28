# M2 L6 preview runner adapter 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: ready-for-review
- Summary: M2 `Week2SparkRunner`가 M3 L6 preview-only spec을 받아 local preview Parquet와 `Week2RunnerResult` 호환 evidence를 만들 수 있다.

## Recommended Next Action / 권장 다음 행동

- 최신 main sync 확인 후 PR을 생성한다.
- Reason: focused/backend/harness 검증은 통과했고, PR 생성 후 remote CI와 review를 확인하면 된다.

## Options / 선택지

1. PR을 생성하고 CI를 확인한다.
2. main 변경이 있으면 sync 후 재검증한다.
3. 후속 Phase로 Product Health 실제 L6 spec/gold path 실행을 시작한다.
4. 이 workspace를 보류한다.

## Waiting On Human / 사람 응답 대기

- PR merge/finalize/cleanup은 PR 생성 후 사람 확인을 받는다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 “머지하고 다음꺼 진행해”라고 지시했다.

## Next AI Action / 다음 AI 행동

- option 1이면 main sync, PR 생성, CI 확인을 진행한다.
- option 2이면 sync 결과와 충돌 여부를 `sync.md`에 기록하고 재검증한다.
- option 3이면 새 workspace를 만든다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
