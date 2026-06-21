# 16. Existing Codebase Adoption

This document defines how to apply the harness to a repository that already has code, configuration, tests, docs, CI, PR, or branch conventions.

## Purpose

Use Existing Codebase Adoption when a repo already has meaningful project state.
Do not rewrite the project or retroactively create workspaces for every old feature.

The adoption strategy is:

```text
baseline + next-change adoption
```

First record the current state as baseline evidence.
Then use the normal Phase Workflow for future changes.

## Selection Criteria

The criterion is not whether the project is complete.
The criterion is whether the repo already has codebase and operational inertia that the harness should respect.

## When To Use

- A project in progress that already has code.
- An unfinished MVP with meaningful structure, config, or tests.
- A repo with existing README, run commands, test commands, CI, PR, or branch rules.
- A repo inherited from another person, team, or AI agent.
- A project where code describes current behavior better than docs.
- A project that should keep working while future changes move into harness workflow.

## When Not To Use

- Empty repo.
- Requirements-only project with little or no code.
- Throwaway spike.
- Approved full redesign where existing structure will intentionally be discarded.

## Principles

- Current working code and current repo state are baseline evidence until Source of Truth is mapped and verified.
- Baseline evidence describes current behavior, not necessarily desired or correct behavior.
- Existing CI, PR, and branch policies are recorded first, not overwritten blindly.
- Do not retroactively create workspaces for every old feature.
- Create one baseline report, optionally with a date or Phase suffix if adoption is repeated.
- Future changes return to normal Phase Workflow in `docs/08-development-workflow.md`.
- Mapped and verified Source of Truth wins after adoption.
- Unknown or stale docs should be marked as gaps, not silently trusted.

## Minimal Adoption Set

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/04-development-guide.md`
- `docs/08-development-workflow.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `docs/workflows/README.md`
- `docs/reports/_template.md`

## Recommended Adoption Flow

1. Copy harness files into the repo.
2. Use Bounded Audit Read from `docs/15-context-budget-rule.md`, limited to repo structure and key config/docs first.
3. Map existing project docs/code to `docs/00-layer-map.md`.
4. Record existing run, test, build, CI, PR, and branch rules.
5. Create `docs/reports/baseline-existing-codebase-adoption.md` or a dated/Phase-suffixed equivalent.
6. Record current main/base commit and known risks.
7. Fill only missing critical Source of Truth docs.
8. Start the next real change with `scripts/start-workflow.sh`.

## Bounded Audit Read Scope

Start with:

- repo structure
- README and existing docs
- package/build/test config
- CI files
- branch/PR policy files if present
- key source directories by summary first, not every source file

Escalate only when a gap, conflict, high-risk area, or next-change requirement needs deeper reading.

## Baseline Report Requirements

The baseline report should record:

- project name
- current main/base commit
- current run/build/test commands
- existing CI/CD/PR/branch rules
- key directories/modules
- known risks
- docs that are missing or stale
- infrastructure gaps
- next Phase candidates
- P0 items before the first risky implementation feature
- deferred gaps and reason
- accepted risk
- what was intentionally not backfilled
- next-change recommendation

## Infrastructure / Operations Gap Assessment

Missing infrastructure does not mean failed adoption.
Record missing or unclear items as `gap`, `deferred follow-up`, `next Phase candidate`, or `not applicable`.

P0 gaps block the first risky implementation feature, not baseline, documentation, or diagnostic work.
If automated tests do not exist, a documented manual smoke path may temporarily satisfy the initial verification path, with test automation recorded as a P1/P2 follow-up.

| Area | What To Check | Risk If Missing | Suggested Priority | Record Location |
| --- | --- | --- | --- | --- |
| Local run / setup | install command, run command, supported runtime | nobody can reproduce the app locally | P0 | baseline report, `docs/04-development-guide.md` |
| Dependency install | package manager, lockfile, setup notes | inconsistent local environments | P0/P1 | baseline report, `docs/04-development-guide.md` |
| Environment variables / secrets handling | required env vars, example file, secret policy | accidental secret exposure or broken local run | P0 when required to run | baseline report, `docs/04-development-guide.md` |
| Test commands | unit/integration/e2e commands or absence | changes cannot be checked automatically | P0 if no manual smoke exists, otherwise P1 | baseline report, `docs/12-quality-gates.md` |
| Build / lint / typecheck | build and static check commands | PR quality varies by person | P1 | baseline report, `quality.md` for follow-up work |
| CI | provider workflow and required checks | main can break from skipped local checks | P1 if local checks exist | baseline report, `docs/12-quality-gates.md` |
| PR template / review policy | template, review expectations, merge policy | handoff and review criteria drift | P1 | baseline report, `.github/` when adopted |
| Branch policy | branch naming, protected branches, release branches | work can mix or bypass review | P1 | baseline report, `docs/04-development-guide.md` |
| Deployment / CD | deploy command, target, release owner | production changes are unsafe | Conditional P0/P1 | baseline report, `docs/12-quality-gates.md` |
| Smoke test / rollback | smoke path, rollback command/notes | deploy failures are hard to detect or recover | Conditional P0/P1 | baseline report, `docs/07-manual-verification-playbook.md` |
| DB schema / migration / seed | schema source, migration command, seed/reset | data loss or unreproducible state | Conditional P0 | baseline report, `docs/02-architecture.md`, `docs/03-interface-reference.md` |
| Auth / permission / security | auth model, roles, secret handling | security or privacy regressions | Conditional P0 | baseline report, `docs/02-architecture.md`, `docs/03-interface-reference.md` |
| Manual verification / golden path | user-visible smoke or QA path | no shared way to confirm behavior | P1, P0 if no other verification exists | baseline report, `docs/07-manual-verification-playbook.md` |
| Existing known risks / flaky areas | flaky tests, broken flows, tech debt | repeated surprises during first real change | P0/P1 | baseline report, `docs/06-regression-and-failure-scenarios.md` |
| Source of Truth docs | existing docs mapped or marked stale/gap | AI trusts stale docs over code | P0/P1 by next-change risk | `docs/00-layer-map.md`, baseline report |

CI, test, build, or PR policy gaps do not fail adoption by themselves.
Local run, a baseline report, and at least one automated or manual verification path should exist before the first risky implementation feature.

DB, auth, and deploy gaps become Conditional P0 only when the next planned change touches that area or safe verification depends on it.

## Gap To Next Phase Promotion

Use the smallest safe next Phase.
Do not build every missing infrastructure item in one Phase unless the human explicitly chooses that scope.

### P0

Resolve before the first risky implementation feature:

- reproducible local run missing
- no baseline report
- no known automated or manual verification path at all
- DB migration unknown in a DB-backed project when the next risky change touches data or migration safety depends on it
- auth, permission, or security unknown in an auth-backed project when the next risky change touches auth/security or safe verification depends on it
- deploy/rollback unknown when deployment is in scope

### P1

Promote soon, but it may follow baseline/documentation/diagnostic work:

- CI missing but local checks or manual smoke path exist
- PR template or review policy missing
- lint/typecheck/build missing or unclear
- automated tests missing but manual smoke path exists
- manual verification missing for user-facing flow
- key Source of Truth docs stale but not blocking immediate work

### P2

Useful hardening after the core adoption path is stable:

- richer CI matrix
- automated deployment
- expanded E2E coverage
- detailed architecture polish
- report/dashboard automation

### Deferred

Use when:

- not relevant to this project
- not needed before the next feature
- explicitly accepted risk

### Example Adoption Sequence

This sequence is illustrative, not required global Phase numbering:

- Phase 0 - Existing Codebase Baseline Adoption
- Phase 1 - Reproducible Local Run
- Phase 2 - Test And Build Gate
- Phase 3 - CI / PR Handoff
- Phase 4 - Source of Truth Gap Fill
- Phase 5 - First Real Feature Under Harness

## Human Command Examples

```text
이 기존 코드베이스에 하네스를 baseline + next-change 방식으로 붙여줘
```

```text
이미 있는 기능 workspace는 만들지 말고 baseline report만 만들어줘
```

```text
기존 CI/PR 정책은 유지하고 하네스 문서에 연결해줘
```

```text
진행 중인 프로젝트니까 현재 코드 상태를 baseline으로 보고 이후 변경부터 하네스로 관리해줘
```

## AI Stop / Confirm Points

AI should stop and ask before:

- overwriting existing docs
- changing CI files
- changing branch or PR policy
- declaring Source of Truth complete
- creating retroactive workspaces
- treating stale docs as truth over code

## Exit Criteria

- Baseline report exists.
- Layer Map maps existing docs/code or marks gaps.
- Run/test/build commands are recorded.
- Existing CI/PR/branch policy is recorded or explicitly absent.
- Stale or unknown docs are marked as gaps.
- The next real change can use normal Phase Workflow.
