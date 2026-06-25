# 이슈 템플릿 생성 경로 보강 보고서

## Short Report / 짧은 보고

- Type: docs/ops
- Branch/work location: `docs/issue-template-generation-guard`, `docs/workflows/docs/issue-template-generation-guard`
- Date: 2026-06-25
- Workspace state: ready-for-review
- Context Budget mode: Lite Read -> Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, `.github/ISSUE_TEMPLATE/*.md`, `scripts/start-workflow.sh`, `scripts/test-harness.sh`, `scripts/validate-harness.sh`
- Escalated context read: `docs/04-development-guide.md`, `docs/10-next-action-menu.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`, `docs/13-human-command-flow.md`, `docs/18-harness-regression-policy.md`, `docs/reports/_template.md`
- Context omitted intentionally: product implementation docs, unrelated reports, archived workspaces, remote issue/PR body mutation
- Changed: `scripts/start-workflow.sh`는 한국어 issue 제목 prefix, 본문 섹션, type label, `--body-file` 전달을 생성한다. `.github/pull_request_template.md`와 `scripts/prepare-pr.sh`는 PR 상단에 이 PR에서 한 일, 리뷰어가 먼저 볼 것, 검증 요약, 남은 일, 위험/주의를 채운다. `scripts/test-harness.sh`와 `scripts/validate-harness.sh`는 issue/PR template body 회귀를 막는다. `docs/04`, `docs/11`, `docs/13`에 운영 규칙을 반영했다.
- Verified: `bash -n scripts/start-workflow.sh scripts/prepare-pr.sh scripts/test-harness.sh scripts/validate-harness.sh`; GitHub issue template YAML parse; `scripts/start-workflow.sh --dry-run feature sample-korean-issue "샘플 한국어 이슈"`; `scripts/prepare-pr.sh --dry-run docs/workflows/docs/issue-template-generation-guard`; `scripts/test-harness.sh` passed 27; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`; `git diff --check`.
- Remaining: 기존 remote issue/PR 본문 보정은 의도적으로 아직 하지 않았다.
- Next context: after this harness PR, run a separate remote cleanup/update pass for #90-#101 and #96-#99 if desired.
- Risk: `test` type은 아직 합의된 label 정책이 없어 `[검증]` prefix만 붙고 label은 없다.

## Regression Guard / 회귀 보호

- Checked feature: `scripts/start-workflow.sh` generated GitHub issue body/title/label path.
- Protected behavior: generated issue body uses Korean sections, body file delivery, type labels, branch/workspace references, and no literal newline escape.
- Result: passed by `scripts/test-harness.sh` and `scripts/validate-harness.sh --strict`.

## Failure Scenario / 실패 시나리오

- Reviewed failure: GitHub UI template exists but script-created issue bypasses it and creates English/short malformed body.
- Expected behavior: script-created issue uses Korean body sections and `--body-file`.
- Verification: fake `gh` fixture captures body file and labels.
- Result: passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` router check for report evidence.
- Environment: local shell, fake `gh`, no GitHub remote mutation.
- Result: generated issue body was inspected through fixture output and validation.
- Failure/limitation: no real GitHub issue was created by design.
- Evidence: `scripts/test-harness.sh` passed 27.

## Secret / Migration / Env Check

- Secret check: no secret, token, private key, `.env`, or credential added.
- Migration/data change: none.
- Env change: none.
