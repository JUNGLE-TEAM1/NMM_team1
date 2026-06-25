# Project status mismatch guard 보고서

## Short Report / 짧은 보고

- Type: hotfix
- Branch/work location: `hotfix/project-status-mismatch-guard`, `docs/workflows/hotfix/project-status-mismatch-guard`
- Date: 2026-06-25
- Workspace state: complete
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/11-git-sync-policy.md`, `docs/15-context-budget-rule.md`, `docs/08-development-workflow.md`, `scripts/status-workflow.sh`, `scripts/prepare-pr.sh`, `scripts/test-harness.sh`
- Escalated context read: `docs/workflows/hotfix/remote-reconciliation-auto-pr/sync.md`, GitHub issue `#83` events/timeline, GitHub Project `3` status
- Context omitted intentionally: Product/Architecture/Interface docs; product/runtime behavior did not change.
- Changed: `status-workflow.sh` now reports linked issue Project Status and flags `MERGED` PR + `CLOSED` issue + non-`Done` Project Status as lifecycle mismatch; docs forbid automatic correction and warn evidence-only PRs not to cross-reference closed issues; harness regression fixture added.
- Verified: `bash -n scripts/status-workflow.sh scripts/prepare-pr.sh scripts/test-harness.sh`; `scripts/test-harness.sh`; `scripts/validate-harness.sh --strict`; `scripts/status-workflow.sh docs/workflows/hotfix/remote-reconciliation-auto-pr`.
- Remaining: PR 생성/merge/finalize/cleanup은 실행하지 않음.
- Next context: GitHub Project automation 설정에서 closed issue를 `Ready`로 되돌리는 규칙이 있는지 별도 운영 확인 필요.
- Risk: Project item-list 조회는 GitHub CLI 인증과 Project 권한이 필요하며, 실패 시 status는 `not checked`로 남는다.

## Regression Guard / 회귀 보호

- Checked feature: GitHub Project lifecycle status summary
- Protected behavior: 자동보정 없이 mismatch를 감지하고 사람 승인형 보정 안내만 출력한다.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: PR #99처럼 이미 완료된 issue를 다시 cross-reference해 Project automation이 `Ready`로 되돌리는 경우
- Expected behavior: fixture에서는 status summary가 `Project lifecycle mismatch`를 출력하고 자동 변경은 하지 않는다.
- Verification: `scripts/test-harness.sh`; `scripts/status-workflow.sh docs/workflows/hotfix/remote-reconciliation-auto-pr`
- Result: passed; 실제 `#83`은 현재 Project Status `Done`으로 정렬되어 mismatch `no`를 출력한다.

## Manual Verification / 수동 검증

- Document executed: `docs/11-git-sync-policy.md` lifecycle 규칙 검토
- Environment: local shell + GitHub CLI
- Result: 실제 `#83`은 Project Status `Done`으로 정렬되어 정상 상태 확인; mismatch fixture는 harness regression에서 확인
- Failure/limitation: GitHub Project automation 설정 자체는 repo 파일이 아니므로 변경하지 않았다.
- Evidence: workspace `quality.md`
