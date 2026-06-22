# 11. Git Sync Policy

이 문서는 branch workspace가 `main`과 동기화되고, GitHub issue/PR 상태를 추적하는 방식을 정의한다.
branch workspace 생성은 팀 규칙상 GitHub issue 생성을 포함한다.
push, PR 생성, merge 같은 추가 원격 변경은 사람이 명시한 명령으로만 실행한다.

## 1) Core Policy

- Start each Phase from the latest approved `main` Source of Truth.
- Re-sync with `main` before a Phase is considered complete or integration-ready.
- Use `git pull --ff-only` as the default pull policy.
- Do not pull, merge, rebase, push, or create PRs without human confirmation.
- Branch workspace를 만들 때 GitHub issue도 생성한다. 예외가 필요하면 `--no-issue`를 명시하고 이유를 `sync.md`에 기록한다.
- Prefer feature branch push and PR review over direct push to `main`.
- 다른 branch workspace로 이동하기 전에 worktree가 dirty이면 `scripts/start-workflow.sh`가 현재 branch에 checkpoint commit을 만든 뒤 이동한다.
- 같은 branch workspace를 다시 여는 경우에는 자동 checkpoint commit을 만들지 않는다.
- Branch switch confirmation: branch workspace를 전환하기 전 현재 branch, 대상 branch, worktree 상태, uncommitted 변경, checkpoint commit 예상, 대상 workspace, 전환 이유를 요약하고 사람 확인을 받는다.
- "M2 시작해", "다음 Phase 진행", "브랜치 전환해", "main으로 돌아가", "남은 브랜치 진행해", "PR 끝났으니 다음 브랜치로 넘어가"처럼 전환 의도가 명확한 말은 전환 승인으로 볼 수 있다.
- unresolved conflict가 있으면 전환하지 않고 conflict 파일 목록을 보여준 뒤 해결을 요청한다.
- PR merge/finalize 후에는 `scripts/list-active-branches.sh`로 남은 작업 브랜치 큐를 확인한다.

## 2) Phase Start Sync

Before creating or starting a Phase workspace, AI should ask for Git Sync Confirm when a real repository is involved.

Recommended commands after confirmation:

```bash
git switch main
git pull --ff-only
scripts/start-workflow.sh feature project-bootstrap "Project bootstrap"
```

If the worktree has uncommitted or untracked changes while moving to another branch, `scripts/start-workflow.sh` creates a checkpoint commit on the current branch before switching.
If unresolved conflicts exist or the repository is detached, stop and ask the human to resolve the state manually.
Before switching, AI reports whether the checkpoint commit will happen and asks for confirmation unless the user already gave an explicit branch-switch or phase-start command.
After switching, AI reports the current branch and target workspace.

Record the result in the workspace `sync.md` Start Sync section.

## 3) Mid-Phase Sync

During a Phase, AI should check upstream changes when:

- the Phase runs for a long time
- another person pushes to `main`
- shared Source of Truth docs may have changed
- integration depends on another branch

If upstream changes touch `docs/02`, `docs/03`, `docs/05`, `docs/06`, or `docs/07`, stop and ask for Sync Conflict Confirm.

Record checks in `sync.md` Mid-Phase Sync Checks.

## 4) Pre-Merge Sync

Before completion or PR readiness:

1. Confirm local work is ready for verification.
2. Confirm how to re-sync with `main`.
3. Re-apply `main` using the team policy, usually merge or rebase.
4. Resolve conflicts.
5. Run `scripts/validate-harness.sh --strict` and project verification.
6. Record the result in `sync.md` Pre-Merge Sync.

### Source of Truth Sync Preflight

Before PR handoff, AI must compare Source of Truth proposals with the actual branch diff.

- `shared-docs.md`의 `Proposed Source Of Truth Changes` 표에 `docs/...` 파일이 있으면 해당 파일은 base commit 이후 실제 diff에 포함되어야 한다.
- 실제로 수정하지 않는 경우 `decisions.md`의 `Deferred Decisions`에 deferred reason, revisit trigger, target branch/phase를 기록해야 한다.
- `quality.md`에는 Source of Truth Impact Gate 판정과 검증 명령을 기록한다.
- `report.md`에는 최종적으로 적용한 Source of Truth 문서 또는 보류한 문서를 요약한다.

`scripts/validate-harness.sh --strict`는 이 preflight를 자동으로 확인한다. 검사 대상은 `shared-docs.md`의 표 `File` 컬럼뿐이며, historical report, 과거 workspace, archive 문서, 설명 문장에 등장하는 경로는 자동 반영 대상으로 강제하지 않는다.

## 5) Push / PR

Direct `main` push is discouraged.

Preferred flow:

```text
feature branch push -> PR -> review -> merge to main
```

Record pushed branch, PR link, merge status, and issue close status in `sync.md`.

GitHub issue는 branch 생성 시 기본으로 만든다. 이 동작은 팀 규칙이며, `scripts/start-workflow.sh` 실행이 issue 생성까지 포함하는 시작 절차다.

```bash
scripts/start-workflow.sh feature project-bootstrap "Project bootstrap"
scripts/start-workflow.sh --no-issue chore local-notes "Local notes only"
```

PR 준비 단계에서는 linked issue가 있으면 closing keyword를 `sync.md`와 PR 본문에 반영한다.
complete + PR-ready workspace의 remote push와 PR 생성은 팀 기본 자동화로 실행할 수 있다.
자동 PR 생성은 `scripts/prepare-pr.sh --auto-pr <workspace>`를 사용하며, merge/finalize/branch cleanup은 포함하지 않는다.
사람이 `PR 올리지 마`, `로컬에만 둬`, `보류`, `PR은 나중에`, `draft만`이라고 명시하면 자동 PR 생성을 하지 않는다.

```bash
scripts/prepare-pr.sh docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --check-pr-sync docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --auto-pr docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --push --create-pr docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --check-issue docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --close-issue docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --finalize docs/workflows/feature/project-bootstrap
```

중간에 다른 작업이 끼어들면 같은 범위의 작업은 해당 workspace의 `notes.md`, `quality.md`, `sync.md`, `report.md`에 추가 기록한다.
범위가 바뀌면 `Scope Change Confirm`을 해결하고, 필요하면 새 branch workspace를 만든다.
새 branch workspace로 이동하는 순간 dirty worktree가 있으면 현재 branch에 checkpoint commit을 만든다.

Stacked PR처럼 default branch가 아닌 feature branch로 merge되는 PR은 `Closes #123`만으로 issue close가 보장되지 않는다.
PR merge 후 `scripts/prepare-pr.sh --check-issue <workspace>`로 issue 상태를 확인한다.
PR이 merged이고 issue가 아직 open이면 `scripts/prepare-pr.sh --close-issue <workspace>`로 PR merge 근거 comment를 남기고 issue를 닫은 뒤 `sync.md`에 `merge status`와 `issue close status`를 기록한다.
PR 전에는 `scripts/prepare-pr.sh --check-pr-sync <workspace>`로 `sync.md`의 linked issue, closing keyword, pushed branch, PR link, merge/issue status 정적 일관성을 확인한다.
PR merge 후에는 `scripts/prepare-pr.sh --finalize <workspace>`로 PR merged 상태와 issue close 상태를 확인하고 `sync.md`를 최종화한다.
`scripts/prepare-pr.sh --finalize <workspace>`는 성공 후 `scripts/cleanup-merged-branches.sh`를 실행해 merged/closed feature branch cleanup을 자동 수행한다.
PR merge/finalize 후에는 `scripts/list-active-branches.sh`로 남은 작업 브랜치 큐를 확인한다.
남은 브랜치는 active local branch, open PR branch, merged cleanup candidate, no workspace / unknown으로 분류한다.
`PR 진행`은 merged branch cleanup까지 포함하므로 PR finalize 성공 후 별도 추가 승인 없이 local branch, remote branch, stale remote-tracking ref cleanup을 실행한다.
cleanup 대상은 workspace `sync.md`에 `merge status: merged`와 `issue close status: CLOSED`가 기록되어 있고, 현재 checkout branch가 아니며, PR이 `main`에 merge된 feature branch다.
cleanup 실행 순서는 `git ls-remote --heads origin 'feature/*'`, `git push origin --delete <branch...>`, `git branch -d <branch...>`, `git fetch --prune`, `scripts/list-active-branches.sh`, `git branch --list 'feature/*'`, `git ls-remote --heads origin 'feature/*'`이다.
`git branch -D` 강제 삭제는 자동 실행하지 않는다. `git branch -d`가 실패하면 이유를 보고하고 별도 사람 확인을 받는다.
branch cleanup은 Git branch/ref cleanup만 의미한다. AWS resource 삭제, deploy rollback, cloud resource cleanup, database/resource 삭제는 포함하지 않고 별도 명시 승인을 받는다.

하네스 규칙을 추가하거나 branch/workspace 흐름 문제를 재발 방지 규칙으로 반영한 뒤에는 표준 흐름 검사를 실행한다.

```bash
scripts/harness-flow-check.sh docs/workflows/<type>/<short-kebab-name>
```

이 검사는 shell syntax, 기본 harness validation, strict harness validation, workspace status를 한 번에 확인한다.
push, PR 생성, merge, deploy처럼 원격 상태를 바꾸는 작업은 포함하지 않는다.

For ready-for-review, complete, or integration-ready workspaces, Pre-Merge Sync must record either:

- a result, or
- a deferral reason approved by the human.

Before PR handoff, run or review:

```bash
scripts/status-workflow.sh docs/workflows/<type>/<short-kebab-name>
```

After PR finalize, run or review:

```bash
scripts/list-active-branches.sh
```

If the workspace is complete and PR-ready, the handoff must present a choice menu instead of only asking whether to create a PR.
The menu includes PR 진행, 추가 보강, 다음 Phase 이동, 보류, and 외부 실행 승인 단계 when relevant.
Complete PR-ready workspaces create a PR automatically after final local validation and PR sync checks pass.
Automatic PR creation reports the PR link, linked issue, CI/check status, and remaining choices.
`PR 진행` means final validation, push, PR creation, CI check, merge, PR finalize, linked issue close verification, and automatic merged branch cleanup for the current branch.
Merge, finalize, issue close, and branch cleanup are not part of automatic PR creation; they require `PR 진행`, `머지해`, `진행해`, or equivalent explicit human command.
Stop and report back if CI fails, merge conflicts exist, required review is missing, scope drift appears, deployment/AWS resource creation is involved, or the human limited the command to PR creation/draft/hold merge.
Deploy and AWS resource creation still require separate explicit human approval.

Use `.github/pull_request_template.md` as the checklist when the project uses PRs.

## 6) Conflict Handling

When main or another branch changes shared Source of Truth:

1. Stop implementation.
2. Identify impacted layer using `docs/00-layer-map.md`.
3. Record conflict in `shared-docs.md` and `sync.md`.
4. Present a Next Action Menu.
5. Ask for Sync Conflict Confirm or Integration Conflict Confirm.

## 7) Why Not Fully Automate

Pull, merge, rebase, push, and PR operations can change history, mix unrelated work, or publish incomplete decisions.
The harness automates recording and validation, but keeps these operations behind human confirmation.
