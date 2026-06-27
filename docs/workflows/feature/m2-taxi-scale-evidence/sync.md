# M2 Taxi scale evidence Git Sync

main 동기화와 integration readiness를 기록한다.
PR-ready 조건이 clear이면 feature branch push와 PR 생성은 자동 실행할 수 있다.
사람 확인 없이 pull, merge, rebase, PR merge, finalize, issue close, branch cleanup action을 실행하지 않는다.

## Start Sync / 시작 sync

- main branch: main
- current branch: feature/m2-taxi-scale-evidence
- base commit: e640f90
- pulled at:
- command:
- result: Workspace created from feature/m2-taxi-scale-evidence at e640f90; 자동 pull/merge/rebase는 실행하지 않음.

## Mid-Phase Sync Checks / 진행 중 sync 확인

| Checked At | Upstream Changes | Impacted Source of Truth | Action |
| --- | --- | --- | --- |
| 2026-06-27 | `git fetch origin` 후 `HEAD`와 `origin/main` 모두 `e640f90`; ahead/behind `0/0`. 새 팀원 branch `origin/feature/m5-airflow-smoke-integration`, `origin/feature/m6-duckdb-runtime-integration` 확인. | none for this branch; both are not merged into main yet. | No merge/rebase needed before PR. |
| 2026-06-27 | `origin/main` moved to `b9c5233` after M5 Airflow and M3 contract planner merges. | M5/M3 docs/code only; no direct conflict with M2 Taxi Spark files. | Merged `origin/main` into `feature/m2-taxi-scale-evidence` with no conflicts. |

## Pre-Merge Sync

- main commit: `b9c5233`
- conflicts: none
- validation: `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests -q` -> `67 passed`; `scripts/validate-harness.sh --strict` -> passed; `git diff --check` -> passed
- result: branch synced with latest `origin/main`
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

- linked GitHub issue: #201
- issue link: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/201
- issue creation result: created
- issue project result: added to JUNGLE-TEAM1 project 3; status set to In Progress
- PR closing keyword: Closes #201
- pushed branch: `feature/m2-taxi-scale-evidence`
- PR link: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/206
- merge status: PR open; PR template drift and PR size hard gate fixed; branch synced with latest main before final push
- issue close status:
