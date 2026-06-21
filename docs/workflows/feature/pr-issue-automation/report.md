# PR issue automation 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/pr-issue-automation`, `docs/workflows/feature/pr-issue-automation`
- Date: 2026-06-22
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `scripts/start-workflow.sh`, `scripts/status-workflow.sh`, `.github/pull_request_template.md`, `docs/11-git-sync-policy.md`, `docs/13-human-command-flow.md`
- Escalated context read: none
- Context omitted intentionally: 실제 GitHub 원격 생성은 dry-run 검증으로 대체; 현재 브랜치의 기존 issue 생성은 별도 요청 전까지 실행하지 않음
- Changed: branch 생성 시 issue 기본 생성, 예외용 `--no-issue`, branch switch 전 dirty checkpoint commit, 재발 방지 하네스 규칙 승인 절차, `scripts/harness-flow-check.sh`, `scripts/prepare-pr.sh` PR handoff, sync/status/PR template/policy 문서 확장
- Verified: `bash -n`, `scripts/start-workflow.sh --dry-run`, `scripts/prepare-pr.sh --dry-run`, `scripts/status-workflow.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/harness-flow-check.sh docs/workflows/feature/pr-issue-automation`
- Remaining: push/PR 생성은 사용자가 명시 플래그로 실행할 때 수행
- Next context: 다음 PR handoff 때 `scripts/prepare-pr.sh <workspace>` 사용
- Risk: GitHub CLI 미설치/미인증 환경에서는 issue/PR 원격 작업이 skip 또는 실패로 기록됨. unresolved conflict 또는 detached HEAD에서는 checkpoint commit을 만들지 않고 멈춤. 재발 방지 규칙은 사람 승인 없이 추가하지 않음
