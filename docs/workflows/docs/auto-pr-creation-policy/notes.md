# Auto PR creation policy 노트

## 진행 메모

- 현재 worktree에는 기존 `README.md`, `docs/reports/project-onboarding-summary.md`, `docs/workflows/docs/current-dev-status-clarity/`, `.DS_Store`류 untracked 파일이 있었다.
- 기존 변경을 checkpoint commit하거나 branch switch하지 않기 위해 `scripts/start-workflow.sh --no-checkout --no-issue docs auto-pr-creation-policy "Auto PR creation policy"`로 workspace만 생성했다.
- 자동 PR 생성 정책은 `feature branch push + PR creation`까지만 허용하고, merge/finalize/issue close/branch cleanup/deploy/cloud/resource 작업은 사람 확인 뒤로 유지한다.
- Historical report와 과거 workspace에는 예전 no-auto-PR 정책 문구가 남아 있지만 Source of Truth가 아니므로 소급 수정하지 않았다.
- 검수 후 `prepare-pr --auto-pr`가 workspace branch와 현재/sync branch가 다르면 push 전에 실패하도록 했다.
- 검수 후 `status-workflow`가 current branch mismatch 또는 dirty/untracked worktree에서는 자동 PR 생성을 보류하도록 했다.

## 결정

- `--auto-pr`를 PR-ready 자동 생성 helper로 복원하고, `--approved-pr`는 호환 alias로 남겼다.
- `Pre-PR Human Checkpoint`는 PR 생성 전 필수 승인 게이트가 아니라 PR 생성 후 merge/finalize/cleanup/handoff 선택 게이트로 재정의했다.
- `linked GitHub issue: none`, `PR closing keyword: n/a` 같은 placeholder 값은 실제 issue/keyword로 보지 않도록 scripts에서 empty-like 값으로 정규화했다.

## 열린 질문

- 현재 checkout branch가 workspace branch와 달라서 `scripts/prepare-pr.sh --auto-pr docs/workflows/docs/auto-pr-creation-policy`는 의도대로 push 전에 실패한다. PR 생성 전 `docs/auto-pr-creation-policy` branch checkout과 included/excluded file 정리가 필요하다.

## 링크 / 증거

- `bash -n scripts/prepare-pr.sh scripts/status-workflow.sh scripts/start-workflow.sh scripts/validate-harness.sh scripts/test-harness.sh scripts/cleanup-merged-branches.sh scripts/list-active-branches.sh`
- `scripts/prepare-pr.sh --auto-pr docs/workflows/docs/auto-pr-creation-policy` -> expected failure before push: workspace branch mismatch
