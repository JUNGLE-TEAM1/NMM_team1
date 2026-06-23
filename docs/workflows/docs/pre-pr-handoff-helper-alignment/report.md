# Pre-PR Handoff Helper Alignment 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-24
- Workspace state: complete
- Context Budget mode: Escalate Read
- Changed: added `--approved-pr` as the preferred human-approved PR helper, kept `--auto-pr` as deprecated compatibility alias, and clarified checkpoint evidence recording.
- Verified: `scripts/test-harness.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/harness-flow-check.sh docs/workflows/docs/pre-pr-handoff-helper-alignment`
- Remaining: none for this Phase
- Next context: `docs/pre-pr-handoff-helper-alignment`
- Risk: `--auto-pr` remains as deprecated compatibility alias; remove later only if it continues to confuse handoff behavior.

## Verification

- `scripts/test-harness.sh`: passed, 13 tests.
- `scripts/validate-harness.sh`: passed.
- `scripts/validate-harness.sh --strict`: passed.
- `scripts/harness-flow-check.sh docs/workflows/docs/pre-pr-handoff-helper-alignment`: passed.

## Changed Files

- `scripts/prepare-pr.sh`
- `scripts/validate-harness.sh`
- `scripts/test-harness.sh`
- `docs/10-next-action-menu.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/13-human-command-flow.md`
- `docs/workflows/README.md`
- `docs/reports/harness-post-merge-change-audit.md`
- `docs/reports/README.md`
