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
- Changed: Project lifecycle mismatch guard added for `MERGED` PR + `CLOSED` issue + non-`Done` Project Status. Evidence-only PR guidance now avoids closed issue cross-reference. Harness regression fixture covers Project `Ready` stale state.
- Verified: `bash -n scripts/status-workflow.sh scripts/prepare-pr.sh scripts/test-harness.sh`; `scripts/test-harness.sh`; `scripts/validate-harness.sh --strict`; `scripts/status-workflow.sh docs/workflows/hotfix/remote-reconciliation-auto-pr`.
- Remaining: PR 생성/merge/finalize/cleanup은 실행하지 않음.
- Next context: GitHub Project automation 설정에서 closed issue를 `Ready`로 되돌리는 규칙이 있는지 별도 운영 확인 필요.
- Risk: Project item-list 조회는 GitHub CLI 인증과 Project 권한이 필요하며, 실패 시 status는 `not checked`로 남는다. 실제 `#83`은 검증 시점에 Project Status `Done`으로 정렬되어 있었다.
