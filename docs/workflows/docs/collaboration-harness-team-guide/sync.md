# 협업 하네스 팀 사용 가이드 Git Sync

main 동기화와 integration readiness를 기록한다.
PR-ready 조건이 clear이면 feature branch push와 PR 생성은 자동 실행할 수 있다.
사람 확인 없이 pull, merge, rebase, PR merge, finalize, issue close, branch cleanup action을 실행하지 않는다.

## Start Sync / 시작 sync

- main branch: main
- current branch: docs/collaboration-harness-team-guide
- base commit: 09a19f1
- pulled at:
- command:
- result: Workspace created from docs/collaboration-harness-team-guide at 09a19f1; 자동 pull/merge/rebase는 실행하지 않음.

## Mid-Phase Sync Checks / 진행 중 sync 확인

| Checked At | Upstream Changes | Impacted Source of Truth | Action |
| --- | --- | --- | --- |
|  |  |  |  |

## Pre-Merge Sync

- main commit: 09a19f1
- conflicts: none detected in docs-only branch diff
- validation: `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- result: local validation passed from `origin/main` worktree base 09a19f1; pull/merge/rebase는 실행하지 않음.
- deferral reason: none

## PR Conflict Resolution

- conflict detected at:
- conflict detection command:
- conflict type:
- affected files:
- resolution path:
- resolved files:
- revalidation:
- remaining risk:

## Push / PR

- linked GitHub issue: #247
- issue link: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/247
- issue creation result: created
- issue project result: set to Review in JUNGLE-TEAM1 project 3
- PR closing keyword: Closes #247
- pushed branch: docs/collaboration-harness-team-guide
- PR link: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/249
- merge status: open
- issue close status: open
- issue reopen result: reopened closed issue before PR open
