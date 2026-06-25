# 한국어 GitHub Issue/PR 템플릿 개선 Git Sync

main 동기화와 integration readiness를 기록한다.
사람 확인 없이 pull, merge, rebase, push, PR action을 실행하지 않는다.

## Start Sync / 시작 sync

- main branch: main
- current branch: docs/korean-github-templates
- base commit: f3594a4
- pulled at:
- command:
- result: Workspace created from docs/korean-github-templates at f3594a4; 자동 pull/merge/rebase는 실행하지 않음.

## Mid-Phase Sync Checks / 진행 중 sync 확인

| Checked At | Upstream Changes | Impacted Source of Truth | Action |
| --- | --- | --- | --- |
|  |  |  |  |

## Pre-Merge Sync

- main commit: f3594a4
- conflicts: none observed in local diff; no pull/merge/rebase executed
- validation: `git diff --check`; Issue template YAML parse; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`; `scripts/status-workflow.sh docs/workflows/docs/korean-github-templates`; `scripts/prepare-pr.sh --check-pr-sync docs/workflows/docs/korean-github-templates`
- result: local validation passed; ready for feature branch push and PR creation
- deferral reason:

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

- linked GitHub issue: #88
- issue link: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/88
- issue creation result: created
- PR closing keyword: Closes #88
- pushed branch: docs/korean-github-templates
- PR link: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/89
- merge status: open
- issue close status: open until PR merge via `Closes #88`
