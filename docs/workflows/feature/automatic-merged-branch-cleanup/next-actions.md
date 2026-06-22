# Automatic merged branch cleanup 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: automatic merged branch cleanup rule and scripts are implemented; PR checklist is ready after final validation.

## Recommended Next Action / 권장 다음 행동

- PR 진행 여부와 다음 행동을 선택한다.
- Reason: cleanup automation and validation guards are implemented locally.

## Options / 선택지

1. PR 진행: final validation, push, PR 생성, CI 확인, merge, finalize, issue close 확인, automatic merged branch cleanup까지 진행.
2. 추가 보강: cleanup candidate 조건이나 검증 guard를 더 조정.
3. 다음 Phase 이동: 현재 branch를 먼저 PR/merge할지 확인한 뒤 진행.
4. 보류: push/PR 없이 현재 상태 유지.

## Waiting On Human / 사람 응답 대기

- PR 진행, 추가 보강, 다음 Phase, 보류 중 선택한다.

## Last User Choice / 마지막 사용자 선택

- User requested applying the automatic cleanup prompt.

## Next AI Action / 다음 AI 행동

- option 1이면 PR checklist를 확인하고 원격 PR 흐름을 진행한다.
- option 2이면 추가 보강 후 validation을 다시 실행한다.
- option 3이면 branch switch/checkpoint 규칙을 따른다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
