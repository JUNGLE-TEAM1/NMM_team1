# Big dataset manipulation context alignment 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: local validation complete
- Summary: 대용량/복합 데이터셋 조작·가공 문맥 보강과 Source of Truth 최소 수정이 완료됐다.

## Recommended Next Action / 권장 다음 행동

- PR 생성 절차를 진행한다.
- Reason: local validation은 완료됐고, 사용자가 “pr 마무리해”라고 지시해 push/PR 생성이 승인됐다.

## Options / 선택지

1. PR 진행: 사람이 승인하면 push/PR 준비를 진행한다.
2. 추가 보강: 대용량 처리 기준을 더 구체적인 수치 기준으로 확장한다.
3. 보류: 현재 branch를 유지하고 추가 지시를 기다린다.
4. 수정: README 또는 Source of Truth 문구를 다시 조정한다.

## Waiting On Human / 사람 응답 대기

- push/PR 생성은 승인됨. merge/finalize는 PR 상태와 CI 결과 확인 후 별도 판단한다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 “pr 마무리해”라고 지시.

## Next AI Action / 다음 AI 행동

- option 1이면 git status를 확인하고 승인된 push/PR 절차를 진행한다.
- option 2이면 구체 수치 기준 범위를 `plan.md`에 추가하고 Source of Truth를 재검토한다.
- option 3이면 pause reason을 `notes.md`에 기록한다.
- option 4이면 문구를 조정하고 검증을 재실행한다.
