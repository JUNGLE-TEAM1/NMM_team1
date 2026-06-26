# Notion issue sync last-write-wins hotfix Report

## Short Report

- Type: hotfix
- Branch/work location: `hotfix/notion-lww-sync`, `docs/workflows/hotfix/notion-lww-sync`
- Date: 2026-06-26
- Workspace state: in-progress
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `.github/workflows/notion-issue-sync.yml`, `.github/scripts/notion-issue-sync.js`, user hotfix brief
- Escalated context read: `docs/04-development-guide.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`, `docs/reports/README.md`
- Context omitted intentionally: live Notion/GitHub API data inspection; secrets and production mutation are not needed for local hotfix implementation.
- Changed: LWW 방향 결정, absence-as-delete 제거, closed→Done 보존, conflict 기록, idempotent write 비교, workflow dry-run/repository_dispatch trigger, smoke test 추가.
- Verified: `node --check`, smoke test, destructive-call 정적 검사, `git diff --check`, harness validation, strict validation, workflow edge-case tests, workspace status summary.
- Remaining: branch push 후 GitHub Actions `workflow_dispatch` dry_run 확인과 PR/merge 전 remote sync가 필요하다.
- Next context: `.github/scripts/notion-issue-sync.js`, `.github/workflows/notion-issue-sync.yml`, `tests/notion-issue-sync-hotfix-smoke.js`, 이 workspace의 `quality.md`와 `decisions.md`.
- Risk: 실제 GitHub Project/Notion API write smoke는 로컬에서 실행하지 않았다. `Sync Error` conflict row는 사람이 확인해야 한다.
