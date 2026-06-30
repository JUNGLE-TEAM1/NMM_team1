# 15. Context Budget Rule

This document defines how AI should load enough context without reading every file by default.

## Purpose

Context Budget balances two risks:

- Token waste from reading unrelated documents, reports, and workspaces.
- Wrong decisions from skipping required Source of Truth context.

This rule is not "read less at all costs." It is "start light, then expand when risk appears."

Context Budget is about how much context to load.
Context Assumption Check is about which lens to apply before answering or acting.
AI should not replace assumption checks with broad reading, and should not replace required Source of Truth reading with a guessed assumption.

## Read Modes

### Lite Read

Use Lite Read by default for normal feature, fix, docs, test, and status work.

Default inputs:

- `AGENTS.md`
- `docs/00-layer-map.md`
- `scripts/status-workflow.sh <workspace>` output when a workspace exists or can be inferred
- Related `docs/project-context/<name>/README.md` when the request, workspace, branch, or PR topic clearly matches a project context bundle
- 1-3 Source of Truth files directly connected to the request
- Latest report index plus the latest related report only when evidence is needed

AI should state the selected mode briefly and name the primary files it read.

### Fast Path Read

Fast Path Read is a Lite Read variant for small, low-risk changes that meet the Fast Path conditions in `docs/08-development-workflow.md`.

Default inputs:

- `AGENTS.md`
- `docs/00-layer-map.md`
- `scripts/status-workflow.sh <workspace>` output when a workspace exists
- the directly related Source of Truth file or files, usually 1-2 files
- `rg` checks against `docs/05`, `docs/06`, and `docs/07` when acceptance, regression, or manual verification relevance is uncertain

Do not open all acceptance, regression, manual verification, report, or workspace files by default.
Open the detailed section only when `rg` finds a relevant item or the change touches behavior that those documents govern.

Fast Path Read must escalate to Escalate Read when the task touches or discovers API, schema, data, security, migration, deploy, CI/CD workflow, harness behavior, scripts, integration, PR-ready, merge, or remote-state risk.

### Project Context Read

`docs/project-context/` stores project-specific reference context such as meeting decisions, option analysis, and pre-Source-of-Truth decision logs.

Project context is not Source of Truth. Use it to load relevant background, then verify contract, API, schema, validation, and operations decisions against the Source of Truth layers in `docs/00-layer-map.md`.

When a request, branch workspace, or PR topic clearly matches a project context bundle:

- read that bundle's `README.md` first;
- if the bundle has `decisions.md`, treat it as the first project-context document to read after the README;
- read `plan.md` or option-analysis documents only when they are needed for the task;
- if the project context affects contract, API, schema, acceptance, regression, manual verification, or operations behavior, escalate to the directly impacted Source of Truth documents;
- include referenced project context documents in PR/report related-document links when they materially informed the work;
- if project context conflicts with Source of Truth, prefer Source of Truth and propose Change Propagation only when the project context should become binding.

### Escalate Read

Escalate when the task or discovered context affects:

- API, schema, interface, CLI, event, or UI contracts
- DB, data model, permission, privacy, or security behavior
- acceptance, regression, or manual verification paths
- integration branches, source branch conflicts, or shared Source of Truth proposals
- Git sync, stale main, pre-merge, PR readiness, or merge risk
- TDD, CI, CD, deploy, publish, smoke, or rollback gates
- a high-impact decision that needs `docs/14-decision-option-brief.md`
- conflict between reports and Source of Truth

Escalate only to the documents required by the risk signal.
Tell the human when the read scope expands and why.

### Audit Read

Use Audit Read when the human asks for:

- whole-project structure review
- whole-harness risk analysis
- retrospective or audit
- migration planning
- broad consistency check
- collaboration harness evaluation
- Existing Codebase Adoption for a repo that already has code, config, tests, docs, CI, PR, or branch conventions

Audit Read may inspect more Source of Truth documents, the latest report index, selected reports, scripts, and tests.
It still should not blindly read every report or workspace unless the audit target requires it.

For Existing Codebase Adoption, use Bounded Audit Read:

- repo structure
- README and existing docs
- package/build/test config
- CI files
- branch/PR policy files if present
- key source directories by summary first, not every source file

Escalate deeper only when a gap, conflict, high-risk area, or next-change requirement needs it.

## Do Not Read By Default

Do not read these by default:

- all reports
- all branch workspaces
- all manual verification files
- unrelated Source of Truth documents
- historical archived workspace details

Use `rg` and report/status summaries first, then open detailed files only when needed.

## High-Risk Exception

Accuracy beats token savings for:

- legal, license, security, privacy, permission, or data-loss risk
- migrations and destructive data changes
- deployment, publish, production, or rollback work
- merge, rebase, push, PR creation, or PR merge decisions
- high-impact architecture or contract decisions

In those cases, Escalate Read or Audit Read is appropriate even if the request looks small.

## Context Assumption Relationship

For meaningful questions and commands, AI first identifies whether the user is asking for:

- general practice
- this repository's harness rule
- a comparison between both
- execution approval
- policy or high-impact decision

If that lens changes the answer, AI states the assumption at the start of the answer.
If the lens is unclear and acting could change repository state, branch/remote state, PR/merge/finalize/cleanup state, verification scope, contract, deployment, data, secret, or team responsibility, AI asks the human before acting.
This classification does not automatically escalate read mode; it escalates only when the risk signal requires more Source of Truth or evidence.

## AI Response Rule

At the start of meaningful work, AI should briefly state:

- Context Budget mode: Lite Read, Escalate Read, or Audit Read
- primary context read
- why this scope is enough for now
- what signal would cause escalation

At completion, the report should record:

- Context Budget mode
- Primary context read
- Escalated context read
- Context omitted intentionally

## Status Output Rule

`scripts/status-workflow.sh` is a summary entry point.
It does not replace Source of Truth.

Use status output to decide what to read next, then verify risky or contract-changing work against Source of Truth documents.
