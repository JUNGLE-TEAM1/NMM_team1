# Workflow harness slimdown 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: PR conflict resolved and revalidated locally
- Summary: PR #97 conflict was resolved locally by merging `origin/main` into `docs/workflow-harness-slimdown`. Local validation passed; push and PR mergeability recheck are pending.

## Recommended Next Action / 권장 다음 행동

- conflict 해결 commit을 push하고 PR 상태를 다시 확인한다.
- Reason: local validation은 통과했고, GitHub mergeability는 push 이후 다시 계산된다.

## Options / 선택지

1. conflict 해결 commit을 push한다.
2. PR 상태를 다시 확인한다.
3. PR을 보류하고 재개 조건을 남긴다.
4. 사람이 직접 추가 확인한다.

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

- 

## Next AI Action / 다음 AI 행동

- option 1이면 push한다.
- option 2이면 `gh pr view 97`로 mergeability를 확인한다.
- option 3이면 `sync.md`와 `next-actions.md`에 hold reason을 유지한다.
- option 4이면 AI는 현재 상태와 conflict 요약만 유지한다.
