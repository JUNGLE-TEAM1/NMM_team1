# 12. Quality Gates

This document defines how TDD and CI/CD fit into the collaboration harness without forcing heavyweight infrastructure on every project.

## 1) Core Policy

- Use TDD for behavior that affects core logic, regression risk, integration contracts, or bug fixes.
- Treat documentation-only work, formatting, and low-risk mechanical edits as TDD optional.
- CI/CD is a quality gate language first and an automation pipeline second.
- A branch can be complete only when its agreed tests, harness validation, and manual verification evidence are recorded.
- Deployment, publish, destructive migration, and production-impacting CD steps stay behind human confirmation.

## 2) TDD Loop

Use this loop for implementation work:

1. Read the relevant Source of Truth and acceptance criteria.
2. Write or identify the failing test first.
3. Run the test and record the expected failure.
4. Implement the smallest change that passes.
5. Run the test again and record the pass.
6. Refactor only inside the accepted scope.
7. Record evidence in workspace `quality.md` and `report.md`.

If a failing test cannot reasonably be written first, record the reason in `quality.md`.

## 3) Branch Quality Gate

Before a branch is considered complete:

- TDD status is recorded in `quality.md`.
- Unit or focused checks are run when applicable.
- Integration or contract checks are run when the branch touches shared behavior.
- `scripts/validate-harness.sh` passes.
- `scripts/validate-harness.sh --strict` passes before integration or PR readiness.
- Manual verification evidence is recorded when user-visible behavior changes.

## 4) CI Gate

Recommended PR checks:

```text
lint -> unit tests -> integration/contract tests -> build -> harness validation -> strict harness validation
```

Minimum harness-level CI command set:

```bash
bash -n scripts/start-workflow.sh
bash -n scripts/validate-harness.sh
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

Project-specific CI should add stack-specific lint, test, typecheck, build, security, migration, and smoke checks as needed.

An optional harness-level CI example lives at `.github/workflows/harness-validation.example.yml`.
Copy or adapt it when the target project wants provider-based CI.

During Existing Codebase Adoption:

- Missing CI is recorded as a gap or deferred follow-up, not an adoption failure.
- PR-ready or integration-ready work after adoption needs CI-equivalent local checks or a recorded skip reason.
- If no local verification path exists at all, record a P0 gap before the first risky implementation feature.
- If automated tests do not exist, a documented manual smoke path may temporarily satisfy the initial verification path.
- Test automation can then be promoted as a P1/P2 follow-up.

## 5) CD Gate

Use CD only when the project actually deploys or publishes artifacts.

Before deployment:

- PR checks passed.
- Release or deploy target is explicit.
- Smoke test and rollback plan are documented.
- Secrets and environment variables are checked without exposing real values.
- Human confirms deploy/publish/rollback commands.

## 6) Workspace Recording

Each workspace uses `quality.md` to record:

- quality gate status
- TDD approach
- failing test first evidence
- implementation pass evidence
- CI/check commands
- CI/check result
- skipped checks and reasons
- deployment or publish gate when relevant

Reports summarize the result; `quality.md` keeps the working detail.

Quality gate statuses:

- `draft`: checks are not planned yet.
- `planned`: checks are selected but not completed.
- `passed`: required checks passed.
- `passed-with-skips`: required checks passed and skipped checks are recorded.
- `deferred`: checks are intentionally deferred with a reason.

Ready-for-review and complete workspaces must not leave `Quality gate status`, `TDD applies`, or `CI required` as undecided placeholders.
