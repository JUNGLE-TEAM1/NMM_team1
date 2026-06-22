# Internal step prompt standard 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: 내부 단계별 프롬프트 표준이 문서, 새 workspace 템플릿, validation에 반영되었다.

## Recommended Next Action / 권장 다음 행동

- PR 진행 여부와 다음 행동을 선택한다.
- Reason: 로컬 하네스 보강과 검증 기록이 완료되었고 원격 작업은 사람 명시 승인 전까지 실행하지 않는다.

## Options / 선택지

1. PR 진행: final validation, push, PR 생성, CI 확인, merge, finalize, issue close 확인까지 진행.
2. 추가 보강: 내부 Step 양식이나 validation을 더 조정.
3. 다음 Phase 이동: M2 `feature/container-app-skeleton` 시작.
4. 보류: push/PR 없이 현재 상태 유지.

## Waiting On Human / 사람 응답 대기

- 원격 push/PR/merge는 사람 명시 승인 전까지 대기한다.

## Last User Choice / 마지막 사용자 선택

- User requested applying the internal Step prompt standard on 2026-06-22.

## Next AI Action / 다음 AI 행동

- option 1이면 final validation과 PR sync preflight 후 push/PR을 진행한다.
- option 2이면 범위가 커지는지 확인하고 필요하면 `Scope Change Confirm`을 해결한다.
- option 3이면 `scripts/start-workflow.sh feature container-app-skeleton "Container app skeleton"`로 M2 workspace를 만든다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
