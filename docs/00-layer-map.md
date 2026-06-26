# 00. Layer Map

This document defines the reusable layers used by the Change Propagation Rule.
Project-specific files may change, but the layer roles should stay stable.

## 1) Layer Definitions

| Layer | Role | Default Files |
| --- | --- | --- |
| Requirements | User, business, assignment, or stakeholder requirements | `README.md` |
| Product | Product scope, user value, non-goals, and success criteria | `docs/01-product-planning.md` |
| Architecture | System boundaries, data flow, component responsibilities, infrastructure shape | `docs/02-architecture.md` |
| Interface | API, schema, protocol, CLI, event, data contract, or UI contract references | `docs/03-interface-reference.md` |
| Development Operations | branch, test, migration, secret, environment, and delivery rules | `docs/04-development-guide.md` |
| Acceptance | golden paths, demo scenarios, acceptance checklist, and done criteria | `docs/05-acceptance-scenarios-and-checklist.md` |
| Regression | regression guards, failure scenarios, edge cases, and rollback concerns | `docs/06-regression-and-failure-scenarios.md` |
| Manual Verification | step-by-step human verification playbooks and evidence capture | `docs/07-manual-verification-playbook.md`, `docs/manual-verification/` |
| Workflow | Phase queue, prompts, completion criteria, and implementation order | `docs/08-development-workflow.md` |
| Collaboration Agreement | shared working agreements, decision gates, and team-level coordination | `docs/09-collaboration-agreement.md` |
| Next Action Menu | state-based conversational menu protocol for guiding human choices | `docs/10-next-action-menu.md` |
| Git Sync Policy | main synchronization, branch freshness, PR, and Git safety rules | `docs/11-git-sync-policy.md` |
| Quality Gates | TDD, branch checks, CI, CD, and verification evidence rules | `docs/12-quality-gates.md` |
| System Guardrails | system-enforced repository, CI, PR, issue/project, secret, review, and deploy controls | `docs/system-guardrails.md` |
| Human Command Flow | practical human prompts and AI responsibilities for operating the harness | `docs/13-human-command-flow.md` |
| Decision Option Brief | high-impact choice classification, candidate comparison, exclusion reasons, and recommendation format | `docs/14-decision-option-brief.md` |
| Context Budget Rule | Lite/Escalate/Audit read modes for reducing token waste without skipping required context | `docs/15-context-budget-rule.md` |
| Existing Codebase Adoption | baseline + next-change adoption mode for repos that already have codebase or operational inertia | `docs/16-existing-codebase-adoption.md` |
| Parallel Milestone Protocol | optional execution contract for parallel workstreams, milestone ownership, dependencies, shared contracts, and integration order | `docs/17-parallel-milestone-protocol.md` |
| Harness Regression Policy | fixture regression tests and Harness Test Update Gate rules for harness changes | `docs/18-harness-regression-policy.md` |
| Project Context | non-authoritative project-specific reference context, meeting decisions, option analysis, and pre-Source-of-Truth decision logs | `docs/project-context/` |
| Branch Workspaces | branch-specific working plans, notes, and reports | `docs/workflows/` |
| Evidence | Phase reports, Hotfix reports, screenshots, logs, and latest-report index | `docs/reports/` |
| External Summary | concise public or stakeholder-facing summary | `README.md` |

## 2) Change Propagation Paths

Use the earliest impacted layer as the start point, then review/update only the later layers that are affected.

| Change Type | Propagation Path |
| --- | --- |
| Requirements change | Requirements -> Product -> Architecture -> Interface -> Development Operations -> Acceptance -> Regression -> Manual Verification -> Workflow |
| Product scope or user-flow change | Product -> Architecture -> Interface -> Acceptance -> Regression -> Manual Verification -> Workflow |
| Architecture change | Architecture -> Interface -> Acceptance -> Regression -> Manual Verification -> Workflow |
| Interface or schema change | Interface -> Acceptance -> Regression -> Manual Verification -> Workflow |
| Development operations change | Development Operations -> Manual Verification -> Workflow |
| Git sync policy change | Development Operations -> Workflow -> Collaboration Agreement -> Next Action Menu |
| Quality gate change | Development Operations -> Acceptance -> Regression -> Manual Verification -> Workflow -> Collaboration Agreement -> Next Action Menu |
| System guardrail change | Development Operations -> System Guardrails -> Quality Gates -> Workflow -> Collaboration Agreement -> Human Command Flow |
| Human command flow change | Workflow -> Collaboration Agreement -> Next Action Menu |
| Decision option brief change | Workflow -> Collaboration Agreement -> Next Action Menu |
| Parallel milestone protocol change | Workflow -> Parallel Milestone Protocol -> Collaboration Agreement -> Next Action Menu |
| Context budget or context loading change | Workflow -> Collaboration Agreement -> Next Action Menu -> Human Command Flow -> Branch Workspaces -> Evidence |
| Existing codebase adoption mode change | Workflow -> Collaboration Agreement -> Next Action Menu -> Human Command Flow -> Context Budget Rule -> Evidence |
| Harness regression policy change | Quality Gates -> Harness Regression Policy -> Workflow -> Human Command Flow -> Branch Workspaces |
| Acceptance scenario change | Acceptance -> Regression -> Manual Verification -> Workflow |
| Regression/failure criteria change | Regression -> Manual Verification -> Workflow |
| Manual verification change | Manual Verification -> Workflow |
| Implementation bug or Hotfix | Current Workflow Phase first; then update Interface, Acceptance, Regression, or Manual Verification when impacted |
| Evidence conflict | Source of Truth layer wins; update the earliest impacted Source of Truth layer instead of patching Evidence alone |

## 3) Context Loading Paths

Load context by layer, not by reading every document.

| Task Type | Default Context |
| --- | --- |
| Requirements change | Requirements, Product, and impacted downstream layers |
| Architecture change | Architecture, maybe Interface, and impacted Acceptance/Regression/Verification/Workflow sections |
| Interface or schema change | Interface and impacted Acceptance/Regression/Verification/Workflow sections |
| UI/UX or user-flow change | Acceptance, Manual Verification, current Workflow Phase, and 1-2 relevant Evidence reports |
| Core feature or integration change | Architecture, Interface, Acceptance, Regression, Manual Verification, current Workflow Phase, and 1-2 relevant Evidence reports |
| Repository/CI/system guardrail change | Development Operations, System Guardrails, Quality Gates, current Workflow Phase, and related GitHub/CI evidence |
| Hotfix | Current Workflow Phase, related Regression scenario, related Manual Verification playbook, and previous/relevant Evidence report |
| Project-context-backed task or PR | Related `docs/project-context/<name>/README.md`, its canonical decision log when present, then the Source of Truth layers directly impacted by the requested work |
| Whole-project audit or retrospective | Layer Map, Source of Truth layers, Evidence index, and selected reports as needed |

Context Budget modes from `docs/15-context-budget-rule.md` refine these paths:

- Lite Read: read `AGENTS.md`, this Layer Map, workspace status output when available, and 1-3 directly relevant Source of Truth files.
- Escalate Read: add only the Source of Truth and evidence files required by API/data/security/sync/quality/integration/decision risk.
- Audit Read: allow broader reading for whole-project structure checks, risk analysis, retrospectives, migrations, or harness evaluations.

## 4) Project Mapping Template

When adapting this harness, update the mapping below instead of rewriting the model.

```yaml
layers:
  requirements:
    files:
      - "README.md"
  product:
    files:
      - "docs/01-product-planning.md"
  architecture:
    files:
      - "docs/02-architecture.md"
  interface:
    files:
      - "docs/03-interface-reference.md"
  development_operations:
    files:
      - "docs/04-development-guide.md"
  acceptance:
    files:
      - "docs/05-acceptance-scenarios-and-checklist.md"
  regression:
    files:
      - "docs/06-regression-and-failure-scenarios.md"
  manual_verification:
    files:
      - "docs/07-manual-verification-playbook.md"
      - "docs/manual-verification/"
  workflow:
    files:
      - "docs/08-development-workflow.md"
  collaboration_agreement:
    files:
      - "docs/09-collaboration-agreement.md"
  next_action_menu:
    files:
      - "docs/10-next-action-menu.md"
  git_sync_policy:
    files:
      - "docs/11-git-sync-policy.md"
  quality_gates:
    files:
      - "docs/12-quality-gates.md"
  system_guardrails:
    files:
      - "docs/system-guardrails.md"
  human_command_flow:
    files:
      - "docs/13-human-command-flow.md"
  decision_option_brief:
    files:
      - "docs/14-decision-option-brief.md"
  context_budget_rule:
    files:
      - "docs/15-context-budget-rule.md"
  existing_codebase_adoption:
    files:
      - "docs/16-existing-codebase-adoption.md"
  parallel_milestone_protocol:
    files:
      - "docs/17-parallel-milestone-protocol.md"
  harness_regression_policy:
    files:
      - "docs/18-harness-regression-policy.md"
  project_context:
    files:
      - "docs/project-context/"
  branch_workspaces:
    files:
      - "docs/workflows/"
  evidence:
    files:
      - "docs/reports/"
  external_summary:
    files:
      - "README.md"
```

## 5) Lightweight Rule

The Layer Map is a routing guide, not a command to edit every file.
For small changes, update only the earliest impacted layer and the downstream files that actually changed in behavior, contracts, verification, or execution evidence.
