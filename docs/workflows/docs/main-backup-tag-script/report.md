# Main backup tag script 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/main-backup-tag-script`, `docs/workflows/docs/main-backup-tag-script`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/project-context/ad-hoc-main-backup-tag-prompt.md`, existing `scripts/` shell helper patterns
- Escalated context read: none
- Context omitted intentionally: full Source of Truth rewrite, app runtime code, deploy/AWS flows
- Changed: added `scripts/create-main-backup-tag.sh` for explicit `origin/main` backup tag creation; updated the ad-hoc backup prompt to use the script; recorded workspace evidence
- Verified: `bash -n`, dry-run smoke, docs prompt keyword check, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: PR CI/review/merge
- Next context: when the user says "오늘 백업 만들어줘", run `scripts/create-main-backup-tag.sh`; use `--dry-run` for verification without creating/pushing a tag
- Risk: default script run creates and pushes a Git tag to `origin`; it does not create branches or change `main`
