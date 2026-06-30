# Product Health Manual Run contract Git Sync

main 동기화와 integration readiness를 기록한다.
PR-ready 조건이 clear이면 feature branch push와 PR 생성은 자동 실행할 수 있다.
사람 확인 없이 pull, merge, rebase, PR merge, finalize, issue close, branch cleanup action을 실행하지 않는다.

## Start Sync / 시작 sync

- main branch: main
- current branch: feature/product-health-manual-run-contract
- base commit: 218741b8
- pulled at:
- command:
- result: Workspace created from feature/product-health-manual-run-contract at 218741b8; 자동 pull/merge/rebase는 실행하지 않음.

## Mid-Phase Sync Checks / 진행 중 sync 확인

| Checked At | Upstream Changes | Impacted Source of Truth | Action |
| --- | --- | --- | --- |
| 2026-06-30 | `origin/main` advanced `218741b8..6089c725` with PR #307, #308, #310 | `docs/03`, `docs/reports/README.md`, Product Health contract fixtures | Read-only review performed. Merge/rebase deferred because docs/11 requires human confirmation for branch sync state changes. |
| 2026-06-30 | 사람 승인 후 `origin/main@6089c725` merge | Product Health Gold v2 contract, Kafka/LLM UI changes | `git merge origin/main` completed without conflicts. Focused v2 tests rerun. |

## Pre-Merge Sync

- main commit: `origin/main` at `6089c725`
- conflicts: none. `git merge origin/main` auto-merged `docs/03-interface-reference.md` and `docs/reports/README.md`.
- validation: `PYTHONPATH=backend pytest backend/tests/test_target_dataset_run_handoff.py backend/tests/test_target_dataset_job_draft.py backend/tests/test_product_health_processing_template.py tests/test_product_health_contracts.py -q` -> `15 passed in 0.40s`
- result: merged
- deferral reason: n/a

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

- linked GitHub issue: #311
- issue link: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/311
- issue creation result: created
- issue project result: added to JUNGLE-TEAM1 project 3; status set to In Progress
- PR closing keyword: Closes #311
- pushed branch: `feature/product-health-manual-run-contract`
- PR link: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/312
- merge status: open
- issue close status: open
