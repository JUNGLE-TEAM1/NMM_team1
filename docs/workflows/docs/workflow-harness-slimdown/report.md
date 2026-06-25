# 워크플로 하네스 슬림다운 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/workflow-harness-slimdown`, `docs/workflows/docs/workflow-harness-slimdown`
- Date: 2026-06-25
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/10-next-action-menu.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`, `docs/13-human-command-flow.md`, `docs/15-context-budget-rule.md`, `docs/17-parallel-milestone-protocol.md`
- Escalated context read: `docs/18-harness-regression-policy.md`, `docs/reports/_template.md`
- Context omitted intentionally: unrelated Source of Truth docs, historical reports, archived workspaces
- Changed: `docs/08-development-workflow.md`를 router 중심으로 압축하고 하위 정책 상세 반복을 canonical 문서 참조로 정리. 추가로 `scripts/prepare-pr.sh`가 `.github/pull_request_template.md`를 읽어 자동 PR body를 만들도록 보강하고, Issue template title prefix와 prepare-pr fallback PR 제목을 한국어화했다. `scripts/test-harness.sh` prepare-pr fixture와 workspace evidence를 업데이트했다.
- Verified: `bash -n scripts/prepare-pr.sh scripts/test-harness.sh scripts/start-workflow.sh`; Issue template YAML parse; `scripts/prepare-pr.sh --dry-run docs/workflows/docs/workflow-harness-slimdown`; `scripts/test-harness.sh` passed 26; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`; `git diff --check`. 제품 acceptance/manual verification 영향 없음 확인.
- Remaining: 기존 hotfix `sync.md` 수정은 이번 PR 범위에서 제외한다. 변경 commit push와 GitHub PR 상태 재확인이 필요하다.
- Next context: PR에는 `docs/08-development-workflow.md`, `.github/ISSUE_TEMPLATE/*.md`, `scripts/prepare-pr.sh`, `scripts/test-harness.sh`, `docs/workflows/docs/workflow-harness-slimdown/`, `docs/reports/pr-template-auto-body-alignment.md`, `docs/reports/README.md`를 포함한다.
- Risk: `prepare-pr` 자동 PR body 생성 동작을 바꿨으므로 reviewer는 실제 PR 생성 전 `--dry-run` body와 linked issue closing keyword를 확인해야 한다. 원격 push/PR 생성/merge/finalize/cleanup은 실행하지 않았다.
