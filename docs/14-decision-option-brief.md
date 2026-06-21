# 14. Decision Option Brief

This document defines how AI should present high-impact choices to humans.

## Purpose

Decision Option Briefs turn important choices into comparable design options.
They help the human see impact, tradeoffs, excluded options, recommendation, and rollback conditions before confirming a direction.

## When To Use

Use a Decision Option Brief when a choice affects:

- MVP scope or feature splitting
- data model, permission, privacy, or security behavior
- API, UI contract, or shared Source of Truth
- architecture boundaries or data flow
- Git sync, integration, conflict resolution, or PR strategy
- TDD, CI, CD, deployment, or quality gates
- feature enhancement direction

## When Not To Use

Do not use this format for small reversible choices such as:

- button wording
- internal variable names
- small documentation phrasing
- test names
- local UI placement that is easy to revert

## Candidate Rules

- Default to 2 candidates.
- Use 1 candidate when the decision is simple and the alternatives are clearly inferior.
- Use up to 3 candidates for large structural decisions.
- Do not present 4 or more candidates. Move weaker options to "Excluded Options" with reasons.
- Always recommend one option, but leave the final choice to the human.

## Common Output Skeleton

```md
# Decision Option Brief

## Judgment Target

- Decision:
- Decision type:
- Why decide now:
- Blocked if undecided:

## Candidate Options

### Option A: [Name]

Reason:
-

[Decision-type-specific impact fields]
-

Deferred To Later:
-

Rollback Or Revisit Conditions:
-

### Option B: [Name]

Reason:
-

[Decision-type-specific impact fields]
-

Deferred To Later:
-

Rollback Or Revisit Conditions:
-

## Excluded Options

Reason per excluded option:
-

## Comparison Summary

| Criteria | Option A | Option B |
| --- | --- | --- |
| [Type-specific criteria] |  |  |

## Recommendation

- Recommended:
- Reason:
- Human decision needed:
```

## Decision Type Templates

### Data / Permission Decision

Impact fields:

- Permission / data judgment criteria:
- DB / API / test impact:
- Privacy / security impact:

Comparison criteria:

- MVP fit
- implementation cost
- extensibility
- DB/API impact
- test impact
- permission/data risk
- rollback difficulty

### UI / UX Decision

Impact fields:

- User flow impact:
- State / error handling impact:
- Accessibility / responsive impact:
- Test impact:

Comparison criteria:

- usability
- implementation cost
- state complexity
- accessibility
- mobile support
- test difficulty
- rollback difficulty

### Architecture Decision

Impact fields:

- Component / module boundary impact:
- Data flow impact:
- extensibility / operations impact:
- Test impact:

Comparison criteria:

- structural simplicity
- extensibility
- coupling
- operational risk
- testability
- rollback difficulty

### Git / Collaboration Decision

Impact fields:

- Branch / sync impact:
- Conflict likelihood:
- Human confirmation needed:
- PR / integration impact:

Comparison criteria:

- safety
- conflict risk
- interruption cost
- integration difficulty
- traceability
- rollback difficulty

### Quality / TDD / CI Decision

Impact fields:

- Test authoring impact:
- CI/check impact:
- failure detection strength:
- development speed impact:

Comparison criteria:

- regression protection
- implementation cost
- runtime
- maintainability
- CI fit
- rollback difficulty

### Scope / MVP Decision

Impact fields:

- MVP include/exclude impact:
- User value impact:
- implementation order impact:
- next-branch impact:

Comparison criteria:

- MVP centrality
- user value
- implementation cost
- dependencies
- ease of later addition
- rollback difficulty

## Recording Rule

After the human chooses:

- Record the accepted or deferred decision in workspace `decisions.md`.
- Update `confirmations.md` when the decision crosses a confirmation gate.
- Update `notes.md` for rationale that future agents should see.
- Update `shared-docs.md`, `quality.md`, or `sync.md` when the decision affects contracts, checks, or Git state.

Decision statuses:

- `none`: no high-impact decision is currently recorded.
- `brief-needed`: a high-impact decision needs a brief before the branch is ready.
- `accepted`: the human selected an option.
- `deferred`: the human deferred the decision with a revisit trigger.
- `mixed`: multiple decisions have different accepted/deferred states.

Ready-for-review, complete, and integration-ready workspaces must not remain at `brief-needed`.
