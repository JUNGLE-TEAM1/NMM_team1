# PR 템플릿 문단형 설명 보강 Git Sync

main 동기화와 integration readiness를 기록한다.
PR-ready 조건이 clear이면 feature branch push와 PR 생성은 자동 실행할 수 있다.
사람 확인 없이 pull, merge, rebase, PR merge, finalize, issue close, branch cleanup action을 실행하지 않는다.

## Start Sync / 시작 sync

- main branch: main
- current branch: docs/pr-template-readable-narrative
- base commit: 8ab9a76
- pulled at:
- command:
- result: Workspace created and branch base corrected to origin/main at 8ab9a76; 자동 pull/merge/rebase는 실행하지 않음. 시작 중 감지된 `hotfix/project-status-mismatch-guard` untracked workspace 파일은 이 branch 범위에서 제외함.

## Mid-Phase Sync Checks / 진행 중 sync 확인

| Checked At | Upstream Changes | Impacted Source of Truth | Action |
| --- | --- | --- | --- |
|  |  |  |  |

## Pre-Merge Sync

- main commit: 8ab9a76
- conflicts: not checked by merge/rebase; branch base is origin/main at start
- validation: local harness validation and dry-run passed
- result: local validation passed; no pull/merge/rebase executed
- deferral reason: PR 생성 전 원격 상태는 CI와 GitHub PR 상태로 확인하고, merge/finalize/cleanup은 사람 확인 후 진행

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

- linked GitHub issue: #111
- issue link: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/111
- issue creation result: created
- issue project result: added to JUNGLE-TEAM1 project 3; status set to In Progress
- PR closing keyword: Closes #111
- pushed branch:
- PR link:
- merge status:
- issue close status:
