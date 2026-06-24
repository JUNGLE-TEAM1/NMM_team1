# PR checkpoint hardening 노트

## 진행 메모

- 원본 worktree에 이전 PR 이후 별도 미추적 파일과 unrelated `docs/reports/README.md` 수정이 남아 있어, `origin/main` 기준 별도 worktree `/Users/tail1/Documents/nmm-pr-checkpoint-hardening`에서 작업했다.
- `scripts/start-workflow.sh`의 기존 `git add -A` checkpoint는 untracked 파일을 자동 추적할 수 있어 tracked-only checkpoint로 변경했다.
- `Small Change Completion Decision`의 `PR 진행` 표현은 `Pre-PR Human Checkpoint` 진입으로 명확히 했다.

## 결정

- automatic checkpoint는 tracked modifications/deletions만 포함한다.
- untracked 파일은 목록으로 보고하고 사람이 명시 stage/commit하지 않는 한 제외한다.

## 열린 질문

- untracked 파일을 checkpoint에 포함하는 opt-in flag가 필요할지는 실제 사용 후 재검토한다.

## 링크 / 증거

- Issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/61
- Validation: `scripts/test-harness.sh` passed with 16 tests.
