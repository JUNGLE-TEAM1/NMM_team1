# Auto PR creation policy 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/auto-pr-creation-policy`, `docs/workflows/docs/auto-pr-creation-policy`
- Date: 2026-06-25
- Workspace state: complete
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/11-git-sync-policy.md`, `docs/08-development-workflow.md`
- Escalated context read: `docs/04-development-guide.md`, `docs/09-collaboration-agreement.md`, `docs/10-next-action-menu.md`, `docs/12-quality-gates.md`, `docs/13-human-command-flow.md`, `docs/18-harness-regression-policy.md`, relevant harness scripts
- Context omitted intentionally: historical reports and archived workspace evidence were not rewritten
- Changed: PR-ready branch는 stop condition이 없으면 feature branch push와 PR 생성을 자동 실행할 수 있게 정책과 helper/status/validation/test harness를 정렬했다. merge/finalize/issue close/cleanup/deploy/cloud 작업은 사람 확인 gate로 유지했다. 검수 후 workspace branch mismatch와 dirty worktree를 자동 PR blocker로 추가했다.
- Verified: `bash -n ...` passed; `scripts/test-harness.sh` passed 18 tests; `scripts/validate-harness.sh --strict` complete-state rerun passed; `scripts/prepare-pr.sh --auto-pr docs/workflows/docs/auto-pr-creation-policy` stopped before push on branch mismatch as expected.
- Remaining: PR 생성 전 `docs/auto-pr-creation-policy` branch checkout과 included/excluded file 정리가 필요하다.
- Next context: 자동 PR 생성 handoff에서는 `scripts/prepare-pr.sh --auto-pr <workspace>`를 기본 helper로 사용하고, PR 생성 뒤 merge/finalize는 `Pre-PR Human Checkpoint`에서 선택한다.
- Risk: 현재 worktree에 unrelated dirty/untracked 파일이 있어 PR 포함/제외 파일 정리는 실제 PR 생성 전 다시 확인해야 한다.
