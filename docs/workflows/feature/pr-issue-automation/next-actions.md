# PR issue automation 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: PR checklist ready
- Summary: issue 생성, PR handoff, issue close status 기록 흐름이 로컬 구현/검증되었다.

## Recommended Next Action / 권장 다음 행동

- 필요하면 `scripts/prepare-pr.sh docs/workflows/feature/pr-issue-automation`로 PR body 초안을 확인한다.
- Reason: 실제 push/PR 생성은 원격 상태를 바꾸므로 명시 플래그로만 실행한다.

## Options / 선택지

1. `scripts/prepare-pr.sh docs/workflows/feature/pr-issue-automation`로 PR 초안을 확인한다.
2. 승인 후 `scripts/prepare-pr.sh --push --create-pr docs/workflows/feature/pr-issue-automation`를 실행한다.
3. PR merge 후 `scripts/prepare-pr.sh --check-issue docs/workflows/feature/pr-issue-automation`로 issue close 상태를 기록한다.
4. 범위가 바뀌면 새 workspace를 만든다.

## Waiting On Human / 사람 응답 대기

- 원격 push/PR 생성 여부.

## Last User Choice / 마지막 사용자 선택

- User said "그러면 진행해"; local automation completed.

## Next AI Action / 다음 AI 행동

- option 1이면 PR body 초안을 출력한다.
- option 2이면 원격 push와 PR 생성을 실행하고 `sync.md`에 기록한다.
- option 3이면 issue close status를 확인하고 `sync.md`에 기록한다.
- option 4이면 새 branch workspace를 만든다.
