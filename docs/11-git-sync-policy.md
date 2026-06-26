# 11. Git Sync Policy

이 문서는 branch workspace가 `main`과 동기화되고, GitHub issue/PR 상태를 추적하는 방식을 정의한다.
branch workspace 생성은 팀 규칙상 GitHub issue 생성을 포함한다.
feature branch push와 PR 생성은 PR-ready 조건을 통과하면 자동화할 수 있다.
pull, merge, rebase, PR merge, finalize, issue close, branch cleanup, deploy 같은 추가 원격/통합 변경은 사람이 명시한 명령으로만 실행한다.
GitHub, CI, Project, repository setting이 실제로 강제해야 하는 항목은 `docs/system-guardrails.md`에서 별도 인벤토리로 추적한다.

## 0) Role Split

- `docs/11-git-sync-policy.md`: branch/workspace sync 기록, PR handoff, conflict recovery, lifecycle evidence protocol.
- `docs/system-guardrails.md`: branch protection, required checks, linked issue required check, Project status automation, secret/review/deploy enforcement inventory.
- `.github/` and repository settings: 가능한 경우 실제 차단 또는 자동화를 수행하는 위치.

## 1) Core Policy

- Start each Phase from the latest approved `main` Source of Truth.
- Re-sync with `main` before a Phase is considered complete or integration-ready.
- Use `git pull --ff-only` as the default pull policy.
- Do not pull, merge, rebase, merge PRs, finalize PRs, close issues, or clean up branches without human confirmation.
- If local validation, pre-merge/pre-PR sync, PR checklist, and stop-condition checks pass, AI may push the feature branch and create the PR automatically.
- If the human says `PR 올리지 마`, `로컬에만 둬`, `보류`, `PR은 나중에`, `draft만`, or an equivalent opt-out before PR creation, do not push or create a PR.
- After PR creation, run `Pre-PR Human Checkpoint` before merge, finalize, issue close, branch cleanup, integration handoff, or next Phase handoff.
- Branch workspace를 만들 때 GitHub issue도 생성한다. 예외가 필요하면 `--no-issue`를 명시하고 이유를 `sync.md`에 기록한다.
- Prefer feature branch push and PR review over direct push to `main`.
- System-enforced `main` protection and required PR settings are tracked in `docs/system-guardrails.md`.
- 다른 branch workspace로 이동하기 전에 worktree가 dirty이면 `scripts/start-workflow.sh`가 현재 branch에 checkpoint commit을 만든 뒤 이동한다.
- checkpoint commit은 tracked file의 수정/삭제만 자동으로 stage한다.
- untracked file, `.DS_Store`, 개인 초안, editor artifact, unrelated workstream file은 자동 checkpoint에 포함하지 않고 제외 목록으로 보고한다.
- 새 파일을 checkpoint에 포함해야 하면 branch 전환 전에 사람이 명시적으로 포함 범위를 확정하고 stage/commit한다.
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
The automatic checkpoint stages tracked modifications/deletions only.
Untracked files are reported but left unstaged, so personal drafts and local artifacts do not become team history by accident.
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

Record pushed branch and PR link in `sync.md`.
Before merge, `sync.md` may also hold local handoff values such as `merge status: open` and `issue close status: open`.
After merge, GitHub PR/issue state is the authoritative status source because local finalization edits can happen after the PR has already been merged into `main`.

GitHub issue는 branch 생성 시 기본으로 만든다. 이 동작은 팀 규칙이며, `scripts/start-workflow.sh` 실행이 issue 생성까지 포함하는 시작 절차다.
local branch creation은 GitHub가 직접 감지할 수 없으므로 이 단계는 branch protection 같은 hard system gate가 아니라 script-enforced protocol이다.
기본 생성된 issue는 `JUNGLE-TEAM1` organization Project `3`에도 추가하고 Status를 `In Progress`로 설정한다.
Project 추가와 Status 설정의 성공 또는 실패 이유는 workspace `sync.md`의 `issue project result`에 기록한다.
`scripts/start-workflow.sh`가 만든 issue는 GitHub UI issue template을 자동으로 타지 않으므로, 스크립트가 직접 한국어 title prefix, body sections, 작업 type별 label을 생성한다.
Issue body는 literal newline escape가 남지 않도록 `--body-file` 경로로 전달한다.

### GitHub Record Drift Audit

GitHub issue/PR이 UI, `gh`, 외부 자동화, 또는 오래된 스크립트 경로로 생성되면 하네스 템플릿을 우회할 수 있다.
이 경우 `scripts/audit-github-records.sh`를 먼저 실행해 한국어 issue title/body/label, PR 제목, 읽기 쉬운 PR handoff body, closing keyword 누락을 읽기 전용으로 확인한다.
PR 제목은 한국어 prefix 양식을 따라야 한다. `[기능]`, `[버그]`, `[문서/운영]`, `[긴급수정]`, `[검증]` 중 하나로 시작해야 하며, 영어 기술명, branch name, API/schema 이름은 prefix 뒤 제목 안에 포함할 수 있다. `docs:`, `feat:`, `fix:`, `chore:`, `test:`, `hotfix:` 같은 conventional prefix 제목, 영어-only 제목, 또는 한국어가 있더라도 하네스 prefix가 없는 제목은 drift로 본다.

```bash
scripts/audit-github-records.sh --issue 112
scripts/audit-github-records.sh --pr 114
```

`scripts/status-workflow.sh <workspace>`는 linked issue 또는 PR link가 있고 GitHub CLI를 사용할 수 있을 때 이 감사를 함께 표시한다.
드리프트가 있으면 complete + PR-ready workspace라도 `PR checklist ready`를 record drift 상태로 낮추고 자동 PR 생성 권고를 멈춘다. 이때 사람이 확인할 수 있게 drift reason, 현재 title, suggested title/label을 보고한다.
이 감사는 GitHub record를 수정하지 않는다. 기존 issue/PR 보정은 별도 사람 지시 후 수행한다.

Linked issue와 Project Status lifecycle은 아래 순서가 기준이다.
시스템 강제/자동화 후보와 현재 상태는 `docs/system-guardrails.md`의 Lifecycle Guardrails와 Guardrail Inventory를 따른다.

```text
branch start -> issue + Project In Progress
PR open -> Project Review
PR merge/finalize -> issue closed + Project Done
```

- `scripts/start-workflow.sh`는 linked issue를 만들고 Project Status를 `In Progress`로 둔다.
- `scripts/prepare-pr.sh --auto-pr`, `--approved-pr`, `--push --create-pr`, 또는 `--create-pr`가 PR을 만들거나 기존 PR을 감지하기 전 linked issue가 `CLOSED`이면 active work issue로 reopen을 시도하고 결과를 `sync.md`에 기록한다. 그 뒤 linked issue의 Project Status를 `Review`로 둔다.
- linked issue close와 Project `Done` 전환은 PR merge 후 `scripts/prepare-pr.sh --close-issue` 또는 `--finalize` 경로에서만 수행한다.
- PR이 아직 `OPEN`인데 linked issue가 이미 `CLOSED`이면 lifecycle mismatch다. `scripts/status-workflow.sh <workspace>`는 이를 별도 warning으로 보고하고, issue reopen + Project `Review` 정렬 또는 finalize evidence 확인을 권고한다. 이는 PR 생성 뒤 외부 조작이나 reopen 실패를 잡는 사후 안전망이다.
- PR이 `MERGED`이고 linked issue가 `CLOSED`인데 Project Status가 `Done`이 아니면 lifecycle mismatch다. `scripts/status-workflow.sh <workspace>`는 이를 별도 warning으로 보고하고, 자동 보정하지 않는다. 사람 승인 후 `scripts/prepare-pr.sh --finalize <workspace>` 재실행 또는 GitHub Project UI에서 `Done` 수동 정렬로 처리한다.
- 이미 merge/finalize된 workspace의 evidence-only PR이나 post-merge sync PR은 닫힌 linked issue를 `#123`처럼 직접 cross-reference하지 않는다. 필요하면 `Issue 123`, `PR 85`, workspace path, 또는 plain text를 사용해 GitHub Project automation이 닫힌 issue를 `Ready` 등으로 되돌리는 것을 피한다.
- 과거 issue를 일괄 Project에 반영할 때는 이미 `CLOSED`인 issue 또는 사람이 명시한 target list에 한정한다. 열린 issue를 대량으로 `Done` 처리하지 않는다.

```bash
scripts/start-workflow.sh feature project-bootstrap "Project bootstrap"
scripts/start-workflow.sh --no-issue chore local-notes "Local notes only"
```

PR 준비 단계에서는 linked issue가 있으면 closing keyword를 `sync.md`와 PR 본문에 반영한다.
complete + PR-ready workspace는 아래 조건을 모두 만족하면 feature branch push와 PR 생성을 자동 실행할 수 있다.

- `scripts/validate-harness.sh --strict`와 필요한 local validation이 통과했다.
- Pre-Merge Sync 또는 승인된 deferral reason이 `sync.md`에 기록되어 있다.
- `scripts/prepare-pr.sh --check-pr-sync <workspace>`가 통과했다.
- included/excluded file 범위가 분리되어 있고 `.DS_Store`, 개인 초안, unrelated untracked file이 제외됐다.
- linked issue와 PR closing keyword가 필요한 경우 `sync.md`와 PR body에 반영됐다.
- 사람의 opt-out 문구나 scope drift, conflict, CI/check blocker, data migration, deploy/cloud 영향이 없다.

GitHub Issue / Project / PR 같은 원격 운영 상태를 직접 보정한 뒤, 그 보정을 하네스 스크립트/문서/검증 규칙으로 재현 가능하게 반영한 변경은 complete + PR-ready 조건을 통과하면 자동 PR 대상이다.
이 규칙은 commit, feature/hotfix branch push, PR 생성까지만 허용한다.
PR merge, issue close/finalize, branch cleanup, deploy/cloud/resource 변경은 기존과 같이 사람의 명시 지시가 필요하다.

사람이 `PR 올리지 마`, `로컬에만 둬`, `보류`, `PR은 나중에`, `draft만`이라고 명시하면 PR 생성을 하지 않는다.
사람이 로컬 완료 보류를 선택하면 `sync.md`의 `Pre-Merge Sync` 또는 `Push / PR` 섹션에 deferral reason을 기록하고 `next-actions.md`에 재개 조건을 남긴다.

```bash
scripts/prepare-pr.sh docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --check-pr-sync docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --auto-pr docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --approved-pr docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --push --create-pr docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --check-issue docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --close-issue docs/workflows/feature/project-bootstrap
scripts/prepare-pr.sh --finalize docs/workflows/feature/project-bootstrap
```

`--auto-pr`는 PR-ready 조건을 통과한 workspace에서 final PR sync check, feature branch push, PR 생성을 자동 실행하는 기본 helper다.
`--approved-pr`는 과거 호환용 alias이며, 사람이 명시 승인한 경우에도 같은 push/PR 생성 helper로 동작한다.

중간에 다른 작업이 끼어들면 같은 범위의 작업은 해당 workspace의 `notes.md`, `quality.md`, `sync.md`, `report.md`에 추가 기록한다.
범위가 바뀌면 `Scope Change Confirm`을 해결하고, 필요하면 새 branch workspace를 만든다.
새 branch workspace로 이동하는 순간 dirty worktree가 있으면 현재 branch에 checkpoint commit을 만든다.

Stacked PR처럼 default branch가 아닌 feature branch로 merge되는 PR은 `Closes #123`만으로 issue close가 보장되지 않는다.
PR merge 후 `scripts/prepare-pr.sh --check-issue <workspace>`로 issue 상태를 확인한다.
PR이 merged이고 issue가 아직 open이면 `scripts/prepare-pr.sh --close-issue <workspace>`로 PR merge 근거 comment를 남기고 issue를 닫은 뒤 `sync.md`에 `merge status`와 `issue close status`를 기록한다.
linked issue가 closed이면 `scripts/prepare-pr.sh --close-issue` 또는 `--finalize`는 위 lifecycle에 따라 Project Status도 `Done`으로 설정하고 `issue project result`에 결과를 기록한다.
PR 전에는 `scripts/prepare-pr.sh --check-pr-sync <workspace>`로 `sync.md`의 linked issue, closing keyword, pushed branch, PR link, merge/issue status 정적 일관성을 확인한다.
PR merge 후에는 `scripts/prepare-pr.sh --finalize <workspace>`로 PR merged 상태와 issue close 상태를 확인한다.
linked issue가 없는 `--no-issue` workspace는 finalize 때 PR merged 상태만 확인하고 `issue close status: n/a`로 기록한다.
이 명령이 local `sync.md`를 갱신하더라도, 그 갱신은 이미 merge된 PR에 자동으로 다시 포함되지 않는다.
따라서 `sync.md`의 final fields는 local evidence일 수 있고, `scripts/status-workflow.sh`와 `scripts/list-active-branches.sh`는 PR link가 있으면 GitHub PR/issue 상태를 조회해 stale `sync.md` 값을 보정해서 해석한다.
`scripts/prepare-pr.sh --finalize <workspace>`는 성공 후 `scripts/cleanup-merged-branches.sh`를 실행해 merged/closed workspace branch cleanup을 자동 수행한다.
PR merge/finalize 후에는 `scripts/list-active-branches.sh`로 남은 작업 브랜치 큐를 확인한다.
남은 브랜치는 active local branch, open PR branch, merged cleanup candidate, no workspace / unknown으로 분류한다.
`PR 진행`은 merged branch cleanup까지 포함하므로 PR finalize 성공 후 별도 추가 승인 없이 local branch, remote branch, stale remote-tracking ref cleanup을 실행한다.
cleanup 대상은 현재 checkout branch가 아니며, PR이 `main`에 merge된 workspace branch다.
가능하면 GitHub PR/issue 상태의 `MERGED`/`CLOSED`를 우선 사용하고, GitHub 조회가 불가능할 때만 workspace `sync.md`의 `merge status: merged`와 `issue close status: CLOSED` 기록을 사용한다.
workspace branch prefix는 `feature/*`, `fix/*`, `docs/*`, `test/*`, `chore/*`, `hotfix/*`다.
cleanup 실행 순서는 allowed workspace branch 원격 조회, `git push origin --delete <branch...>`, `git branch -d <branch...>`, `git fetch --prune`, `scripts/list-active-branches.sh`, allowed workspace branch local/remote 확인이다.
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

For PR handoff after PR creation, `Pre-PR Human Checkpoint` must record one of:

- human-approved merge/finalize/cleanup action,
- local hold / deferral reason, or
- next Phase / additional work choice.

Preferred evidence location:

- `confirmations.md`: `## Pre-PR Human Checkpoint` section with human choice and result
- `sync.md`: auto-created PR link, approved merge/finalize action, or deferral reason
- `next-actions.md`: resume condition when held

Before PR handoff, run or review:

```bash
scripts/status-workflow.sh docs/workflows/<type>/<short-kebab-name>
```

After PR finalize, run or review:

```bash
scripts/list-active-branches.sh
```

If the workspace is complete and PR-ready, AI may run final validation and `scripts/prepare-pr.sh --auto-pr <workspace>` to push the feature branch and create the PR unless an opt-out or stop condition exists.
After PR creation, the handoff must present a choice menu instead of only asking whether to merge.
The menu includes merge 진행, 추가 보강, 다음 Phase 이동, 보류, and 외부 실행 승인 단계 when relevant.
`PR 진행` after an already created PR means CI/check status follow-up, merge, PR finalize, linked issue close verification, and automatic merged branch cleanup for the current branch.
PR merge/finalize approval is a single-target approval. The target must be the current workspace PR or an explicitly named PR number/branch in the human message or checkpoint record. Broad wording such as `상태보고 머지까지해`, `남은 PR 머지해`, or `merge 가능한 것 처리해` authorizes status reporting for other open PRs, but it does not authorize merging additional PRs. If more than one open PR is mergeable, stop after the selected target and ask for a separate explicit PR number before merging another PR.
If the human says `PR만`, `PR 생성만`, `초안 PR`, or `머지는 보류`, stop after PR creation and ask again before merge, finalize, issue close, or branch cleanup.
Stop and report back if CI fails, merge conflicts exist, required review is missing, scope drift appears, deployment/AWS resource creation is involved, or the human limited the command to PR creation/draft/hold merge.
Deploy and AWS resource creation still require separate explicit human approval.

Use `.github/pull_request_template.md` as the readable handoff shape when the project uses PRs. The expected PR body has seven sections: PR summary, narrative change explanation, validation, impact scope, reviewer focus, remaining/excluded work, and pre-merge checks. `scripts/prepare-pr.sh` fills this shape from workspace `report.md` fields such as `Changed`, `Verified`, `Remaining`, and `Risk`, so the PR body should read like a review handoff rather than a long audit checklist.
`scripts/prepare-pr.sh` also normalizes PR titles into the Korean prefix format before calling `gh pr create --title`. If a PR body merely references another PR number such as `PR #105`, that reference is not a linked issue and must not be treated as a missing closing keyword.

## 6) PR Conflict Resolution Protocol

PR conflict는 GitHub PR conflict, local merge/rebase conflict, 또는 Source of Truth proposal drift를 포함한다.
AI는 conflict를 발견하면 임의로 merge/rebase/push/PR merge를 계속하지 않고, conflict를 분류한 뒤 사람에게 `PR Conflict Confirm` 또는 기존 `Sync Conflict Confirm`/`Integration Conflict Confirm` 선택지를 제시한다.

Conflict 감지 조건:

- GitHub PR이 `This branch has conflicts` 또는 동등한 conflict 상태를 보고한다.
- `gh pr view` 또는 PR status에서 `mergeable`이 `CONFLICTING`이거나 conflict 의심 상태다.
- 승인된 `git merge`, `git rebase`, 또는 `git pull` 중 conflict가 발생했다.
- `git status`에 unmerged path가 있다.
- base/main 변경과 branch의 Source of Truth proposal이 충돌한다.

Conflict 유형:

- Git text conflict: 같은 파일의 같은 hunk가 충돌한다.
- Source of Truth conflict: `README.md` 또는 `docs/00~18` Source of Truth가 서로 다른 제품/architecture/workflow 방향을 제안한다.
- contract/interface/schema conflict: API, schema, data model, event, CLI, UI contract가 충돌한다.
- test/quality gate conflict: test expectation, CI/check, manual verification, quality gate가 충돌한다.
- generated artifact / report / workspace evidence conflict: report, workspace evidence, generated artifact가 Source of Truth 또는 현재 branch 증거와 맞지 않는다.
- external dependency / lockfile conflict: dependency version, lockfile, toolchain, container/runtime 설정이 충돌한다.

Conflict 감지 직후 AI는 아래를 수행한다.

1. 현재 branch, PR 번호, base branch, conflict 감지 방법을 보고한다.
2. destructive cleanup, 임의 hunk 선택, 자동 rebase continuation, push, PR merge를 실행하지 않는다.
3. conflict 파일과 영향 계층을 `docs/00-layer-map.md` 기준으로 분류한다.
4. `sync.md`에 conflict 감지 시각, 감지 명령, conflict summary, conflict type, affected files를 기록한다.
5. 필요하면 `shared-docs.md`, `decisions.md`, `quality.md`, `report.md`에 영향과 보류/결정 상태를 기록한다.
6. 사람에게 해결 선택지를 제시한다.

새 workspace의 `sync.md` template은 `## PR Conflict Resolution` 섹션을 포함한다.
`scripts/status-workflow.sh <workspace>`는 이 섹션의 conflict type, affected files, resolution path, revalidation, remaining risk를 read-only로 요약한다.
Conflict evidence가 있지만 resolution path 또는 revalidation이 비어 있으면 PR 진행보다 `PR Conflict Confirm`을 우선 권장한다.

사람에게 제시할 기본 선택지:

1. `main 반영 후 현재 branch에서 해결`: 사람이 merge 또는 rebase 방식을 명시하면 그 방식으로 해결한다.
2. `Source of Truth 우선 결정`: 문서/contract 충돌을 먼저 `Decision Option Brief`, `shared-docs.md`, 또는 `decisions.md`에서 확정한다.
3. `작업 분리`: 충돌 범위를 follow-up branch/Phase로 분리하고 현재 PR 범위를 줄인다.
4. `PR 보류`: PR은 유지하고 `sync.md`와 `next-actions.md`에 재개 조건을 기록한다.
5. `사람 직접 해결`: AI는 현재 상태와 conflict 목록만 남기고 멈춘다.

merge vs rebase 선택:

- 기본은 repo의 현재 Git sync policy와 사람 지시에 맞춘다.
- merge/rebase/pull은 모두 사람 확인 전 실행하지 않는다.
- history rewrite 가능성이 있는 rebase는 더 명시적인 확인이 필요하다.
- conflict 해결 중 `git rebase --continue`, `git merge --continue`, force push, branch deletion, destructive cleanup은 별도 승인 또는 이미 승인된 정확한 절차 안에서만 실행한다.

Conflict 해결 후 필수 재검증:

```bash
git status --short
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

추가로 관련 test/build/smoke/manual verification을 다시 실행한다.
하네스 규칙, script, CI harness job이 바뀌었으면 `scripts/test-harness.sh`도 실행하거나 skip/deferred reason을 `quality.md`와 `decisions.md`에 기록한다.
Source of Truth 변경이 있으면 `shared-docs.md`, `decisions.md`, `quality.md`, `report.md`의 정합성을 다시 확인한다.

PR 재진행 기준:

- conflict가 사라졌다.
- local validation이 통과했다.
- PR CI/check 상태를 다시 확인했다.
- `sync.md`에 resolution method, resolved files, validation result, remaining risk가 기록됐다.
- 사람이 제한한 범위, 예를 들어 `PR만`, `merge 보류`, `사람 직접 해결`을 넘지 않는다.

Final response는 conflict 유형, 해결 방식, 재검증 결과, 남은 PR/CI/merge 상태를 요약한다.
Conflict를 보류하면 재개 조건과 사람이 해야 할 다음 선택을 명확히 남긴다.

## 7) Conflict Handling

When main or another branch changes shared Source of Truth:

1. Stop implementation.
2. Identify impacted layer using `docs/00-layer-map.md`.
3. Record conflict in `shared-docs.md` and `sync.md`.
4. Present a Next Action Menu.
5. Ask for Sync Conflict Confirm or Integration Conflict Confirm.

## 8) Why Not Fully Automate

Pull, merge, rebase, push, and PR operations can change history, mix unrelated work, or publish incomplete decisions.
The harness automates recording and validation, but keeps these operations behind human confirmation.
