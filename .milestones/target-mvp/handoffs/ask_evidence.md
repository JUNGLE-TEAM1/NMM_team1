# Ask / Evidence Handoff

## Workstream

- ID: `ask_evidence`
- Alias: `R5`
- Branch candidate: `feature/ask-evidence`
- Status: `ready_with_mock`

## Allowed Write Scope

- `backend/app/domain/**`
- `backend/app/services/**`
- `backend/app/api/**`
- `frontend/src/features/**`
- `docs/workflows/feature/ask-evidence/**`

## Required Contracts

- `EvidenceItem`
- `RetrievalTrace`
- `PolicyDecision`

## Mock/Fake Boundary

- deterministic answer routes and fixture retrieval are allowed.
- Do not call external LLMs, build real vector indexes, or use secret-backed providers without a Decision Option Brief.

## Deliverables

- deterministic Ask route
- evidence or deferred answer
- denied/insufficient evidence path

## Validation Commands

- `scripts/validate-harness.sh`
- `scripts/validate-harness.sh --strict`
- workstream-specific tests TBD in branch `quality.md`

## Contract Changes

- Contract changes require updates to `.milestones/target-mvp/manifest.yaml`, `docs/03-interface-reference.md`, and branch `shared-docs.md`.

## Integration Notes

- Checkpoint: `spine_3`
- Depends on: `contract_baseline`
- Should wait until first wave confirms trust and policy assumptions, unless separately approved.

## Risks / Blockers

- Hallucination risk if evidence requirement is softened.
- External LLM use adds cost, secret, privacy, and audit requirements.
