# Harness status entrypoints Git Sync

main 동기화와 integration readiness를 기록한다.
PR-ready 조건이 clear이면 feature branch push와 PR 생성은 자동 실행할 수 있다.
사람 확인 없이 pull, merge, rebase, PR merge, finalize, issue close, branch cleanup action을 실행하지 않는다.

## Start Sync / 시작 sync

- main branch: main
- current branch: feature/m5-airflow-smoke-integration
- base commit: 7189450
- pulled at:
- command:
- result: Workspace created from feature/m5-airflow-smoke-integration at 7189450; 자동 pull/merge/rebase는 실행하지 않음.

## Mid-Phase Sync Checks / 진행 중 sync 확인

| Checked At | Upstream Changes | Impacted Source of Truth | Action |
| --- | --- | --- | --- |
|  |  |  |  |

## Pre-Merge Sync

- main commit:
- conflicts:
- validation: `scripts/validate-harness.sh` passed; `scripts/validate-harness.sh --strict` passed; `scripts/test-harness.sh` passed 31 fixture regression tests
- result:
- deferral reason: 기존 작업트리 `feature/m5-airflow-smoke-integration`에 사용자 수정이 있어 pull/merge/rebase/branch switch를 실행하지 않음. 이 Phase는 `--no-checkout --no-issue` workspace와 문서 변경으로만 진행.

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

- linked GitHub issue: 
- issue link: 
- issue creation result: not requested
- issue project result: not requested
- PR closing keyword: 
- pushed branch:
- PR link:
- merge status:
- issue close status:
