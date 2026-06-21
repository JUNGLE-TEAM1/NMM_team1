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
remote push나 PR 생성은 명시 플래그를 붙였을 때만 실행한다.

```bash
scripts/prepare-pr.sh docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --push --create-pr docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --check-issue docs/workflows/feature/project-bootstrap
```

중간에 다른 작업이 끼어들면 같은 범위의 작업은 해당 workspace의 `notes.md`, `quality.md`, `sync.md`, `report.md`에 추가 기록한다.
범위가 바뀌면 `Scope Change Confirm`을 해결하고, 필요하면 새 branch workspace를 만든다.
새 branch workspace로 이동하는 순간 dirty worktree가 있으면 현재 branch에 checkpoint commit을 만든다.

For ready-for-review, complete, or integration-ready workspaces, Pre-Merge Sync must record either:

- a result, or
- a deferral reason approved by the human.

Before PR handoff, run or review:

```bash
scripts/status-workflow.sh docs/workflows/<type>/<short-kebab-name>
```

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
