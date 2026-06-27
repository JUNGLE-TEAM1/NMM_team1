# 12. Quality Gates

This document defines how TDD and CI/CD fit into the collaboration harness without forcing heavyweight infrastructure on every project.
System-enforced repository, CI, PR, issue/project, secret, review, and deploy controls are inventoried in `docs/system-guardrails.md`.

## 1) Core Policy

- Use TDD for behavior that affects core logic, regression risk, integration contracts, or bug fixes.
- Treat documentation-only work, formatting, and low-risk mechanical edits as TDD optional.
- CI/CD is a quality gate language first and an automation pipeline second.
- CI/CD and repository settings should enforce what machines can reliably detect; the harness records evidence, skipped checks, and recovery context.
- A branch can be complete only when its agreed tests, harness validation, and manual verification evidence are recorded.
- Deployment, publish, destructive migration, and production-impacting CD steps stay behind human confirmation.
- Passing local quality gates plus PR readiness authorizes automatic feature branch push and PR creation when no opt-out or stop condition exists; merge, finalize, issue close, cleanup, deploy, and handoff still require `Pre-PR Human Checkpoint`.

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
- Local tool/runtime readiness evidence is recorded before marking required test/build/smoke/manual verification as skipped.
- Source of Truth Impact Gate evidence is recorded when implementation or documentation changes can alter shared project truth.
- Harness Test Update Gate evidence is recorded when harness rules, scripts, or CI harness jobs change.
- GitHub record drift audit evidence is recorded when the branch changes issue/PR template generation, PR handoff body rules, or GitHub lifecycle guard behavior.
- `scripts/validate-harness.sh` passes.
- `scripts/validate-harness.sh --strict` passes before integration or PR readiness.
- After PR conflict resolution, `sync.md` records conflict type, resolution method, resolved files, rerun validation, and remaining PR/CI/merge risk before PR progression resumes. `quality.md` records rerun check commands/results when tests or harness validation are affected.
- Manual verification evidence is recorded when user-visible behavior changes.
- If PR readiness is complete, automatic push/PR creation is recorded in `sync.md`. If merge/finalize/cleanup/handoff is the next natural action, `Pre-PR Human Checkpoint` is recorded in `confirmations.md` before those follow-up remote-changing commands; approved action or deferral details are also recorded in `sync.md` and `next-actions.md` as applicable.

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
Required check status, branch protection, secret scanning, CODEOWNER review, PR linked issue checks, and Project lifecycle automation are tracked in `docs/system-guardrails.md`.
The current `main` ruleset requires `harness`, `container-smoke`, `manifest-smoke`, `linked-issue`, `migration-schema-security`, and `pr-size-hard-gate` checks before merge.
`migration-schema-security` is a hard detection gate for migration/schema/security-sensitive path changes.
`pr-size-hard-gate` blocks PRs over 10 non-evidence files or 600 non-evidence changed lines unless the PR body includes `Large PR Exception: approved`.
`pr-template-drift` is a repo-local PR event check for Korean PR title prefix and 7-section PR body shape; repo admin must confirm whether it is registered as a required context in the active ruleset.
Risky path detection remains advisory.

During Existing Codebase Adoption:

- Missing CI is recorded as a gap or deferred follow-up, not an adoption failure.
- PR-ready or integration-ready work after adoption needs CI-equivalent local checks or a recorded skip reason.
- If no local verification path exists at all, record a P0 gap before the first risky implementation feature.
- If automated tests do not exist, a documented manual smoke path may temporarily satisfy the initial verification path.
- Test automation can then be promoted as a P1/P2 follow-up.

## 5) CD Gate

Use CD only when the project actually deploys or publishes artifacts.
Environment-level approval and deploy protection belong in GitHub Environment or platform settings when available; this document records the verification evidence and human confirmation protocol.

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
- local tool/runtime readiness checks, safe start attempts, fallback attempts, and remaining manual action when validation depends on local runtime
- PR conflict detection/resolution evidence when conflict handling happened: `sync.md` keeps detection/resolution fields, and `quality.md` keeps rerun validation/check result when applicable
- CI/check commands
- CI/check result
- Source of Truth impact: `none`, `required`, `applied`, or `deferred`
- Source of Truth validation command/result when `shared-docs.md` proposes shared document changes
- Harness test impact: `none`, `required`, `updated`, `skipped`, or `deferred`
- Harness regression command/result, usually `scripts/test-harness.sh`, when harness behavior changes
- GitHub record drift audit command/result when GitHub issue/PR template, Korean prefix PR title policy, closing keyword detection, or lifecycle guard behavior changes; live audit commands are read-only and fixture tests cover CI-safe regression cases
- skipped checks and reasons
- deployment or publish gate when relevant

Skipped checks must not be used as the first response to a missing local runtime. AI first records readiness checks such as `command -v <tool>`, version checks, runtime health checks, and safe local start attempts. Host-level install, license acceptance, admin elevation, system setting changes, paid cloud/resource creation, deployment, publish, or destructive operations remain behind human confirmation.

## 7) Harness Regression Tests

Harness behavior is tested with lightweight fixture regression tests.
The detailed Source of Truth for the Harness Test Update Gate, fixture expectations, `scripts/test-harness.sh`, and external E2E boundaries is `docs/18-harness-regression-policy.md`.

Reports summarize the result; `quality.md` keeps the working detail.

## 8) Guardrail Scenario Audit

System guardrail scenario audit is separate from every-PR CI.
Every PR should keep deterministic focused checks, harness regression tests, and strict validation.
Lifecycle, repository setting, Project status, and external E2E rehearsal checks run only as read-only manual/scheduled audit or human-approved rehearsal because they depend on remote state and team tolerance for noise.

Default split:

| Tier | Default Frequency | Examples | Evidence |
| --- | --- | --- | --- |
| Tier 1: PR CI | every PR | linked issue unit tests, migration/schema/security focused tests, PR size hard gate tests, PR risk warning tests, `scripts/test-harness.sh`, `scripts/validate-harness.sh --strict` | `quality.md`, CI check result |
| Tier 2: Read-only scenario audit | manual or scheduled | active workspace drift, merged PR with stale issue/project status, template drift | `sync.md`, `quality.md`, Phase report |
| Tier 3: Admin setting audit | human-approved/read-only | branch protection, required checks, secret scanning, CODEOWNERS, Environment approval | `docs/system-guardrails.md` status update or follow-up |
| Tier 4: External E2E rehearsal | human-approved only | throwaway issue/branch/PR/project lifecycle rehearsal | explicit rollback, stop condition, report evidence |

The canonical scenario matrix is maintained in `docs/system-guardrails.md`.

Quality gate statuses:

- `draft`: checks are not planned yet.
- `planned`: checks are selected but not completed.
- `passed`: required checks passed.
- `passed-with-skips`: required checks passed and skipped checks are recorded.
- `deferred`: checks are intentionally deferred with a reason.

Ready-for-review and complete workspaces must not leave `Quality gate status`, `TDD applies`, or `CI required` as undecided placeholders.
