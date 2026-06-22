# Internal step prompt standard 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/internal-step-prompt-standard`, `docs/workflows/feature/internal-step-prompt-standard`
- Date: 2026-06-22
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `docs/08-development-workflow.md`, `docs/workflows/README.md`, `scripts/start-workflow.sh`, `scripts/validate-harness.sh`
- Escalated context read: none
- Context omitted intentionally: product runtime and M2 implementation files
- Changed: internal Step prompt standard, new workspace `plan.md` template section, validation guard, workspace README role description
- Verified: shell syntax, start-workflow dry-run, harness validation, strict validation, workspace status, diff check
- Remaining: PR 진행 approved by human; push, PR, CI check, merge, finalize, and issue close verification follow the updated handoff rule
- Next context: M2 `feature/container-app-skeleton` can record Step prompts in `plan.md`
- Risk: validation only checks Step structure when `### Step` appears; it does not force small phases to use internal steps
