# Harness flow consistency audit 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: 하네스 흐름 감사와 stale wording 정리가 완료되었고 PR checklist 준비 전 검증만 남았다.

## Recommended Next Action / 권장 다음 행동

- PR 진행 여부와 다음 행동을 선택한다.
- Reason: 공용 문서와 완료 workspace의 PR handoff 의미가 정리되었고 로컬 검증을 통과해야 한다.

## Options / 선택지

1. PR 진행: final validation, push, PR 생성, CI 확인, merge, finalize, issue close 확인까지 진행.
2. 추가 보강: 다른 stale wording이나 validation guard를 더 점검.
3. 다음 Phase 이동: 현재 branch를 먼저 PR/merge할지 확인한 뒤 진행.
4. 보류: push/PR 없이 보류 이유와 재개 조건 기록.

## Waiting On Human / 사람 응답 대기

- PR 진행, 추가 보강, 다음 Phase, 보류 중 선택한다.

## Last User Choice / 마지막 사용자 선택

- 하네스 규칙 충돌/전파 흐름 확인 요청.

## Next AI Action / 다음 AI 행동

- option 1이면 PR checklist를 확인하고 원격 PR 흐름을 진행한다.
- option 2이면 추가 stale wording을 점검하고 검증을 다시 실행한다.
- option 3이면 branch switch/checkpoint 규칙을 따른다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
