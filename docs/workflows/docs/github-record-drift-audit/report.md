# GitHub record drift audit 보강 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/github-record-drift-audit`, `docs/workflows/docs/github-record-drift-audit`
- Date: 2026-06-25
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`, `docs/13-human-command-flow.md`, `scripts/status-workflow.sh`, `scripts/test-harness.sh`, `scripts/validate-harness.sh`
- Escalated context read: 없음
- Context omitted intentionally: 전체 report archive audit는 수행하지 않음
- Changed: GitHub issue/PR record drift audit script 추가, status-workflow PR-ready blocker 연결, 하네스 fixture/static validation 보강, 관련 운영 문서 업데이트, `PR 진행`/`머지까지` 명령의 single-target merge guardrail 추가
- Verified: `bash -n scripts/validate-harness.sh scripts/test-harness.sh scripts/status-workflow.sh scripts/prepare-pr.sh`, `scripts/test-harness.sh`, `scripts/validate-harness.sh --strict`, `git diff --check`, live read-only audit `--issue 112`/`--issue 111`
- Remaining: #112 등 기존 GitHub record 수정은 하네스 보강 이후 별도 작업
- Next context: PR #115 merge 전 `origin/main` conflict를 해결하고 single-target guardrail이 포함된 최종 CI를 확인
- Risk: PR body audit는 PR #114의 7-section 구조를 기준으로 하며, 넓은 merge 지시는 현재 workspace PR 또는 명시 PR 번호 1개로만 제한해야 한다
