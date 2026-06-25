# Human-facing big dataset clarity 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: PR creation approved
- Summary: 사람이 보는 문서의 big dataset clarity 보강을 적용했다.

## Recommended Next Action / 권장 다음 행동

- PR 생성 절차를 진행한다.
- Reason: local validation은 완료됐고, 사용자가 “pr 마무리해”라고 지시해 push/PR/merge/finalize가 승인됐다.

## Options / 선택지

1. PR 진행: 사람이 승인하면 push/PR 준비를 진행한다.
2. 추가 보강: README 또는 온보딩 문구를 더 조정한다.
3. 보류: 현재 branch를 유지하고 추가 지시를 기다린다.
4. 취소: 변경을 적용하지 않는다.

## Waiting On Human / 사람 응답 대기

- push/PR/merge/finalize는 이번 사용자 지시로 승인됨.

## Last User Choice / 마지막 사용자 선택

- 사용자가 “pr 마무리해”라고 지시.

## Next AI Action / 다음 AI 행동

- option 1이면 git status를 확인하고 승인된 push/PR 절차를 진행한다.
- option 2이면 문구를 조정하고 검증을 재실행한다.
- option 3이면 pause reason을 `notes.md` 또는 `sync.md`에 기록한다.
- option 4이면 사용자 확인 후 변경 취소 경로를 진행한다.
