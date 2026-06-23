# Catalog / Trust Handoff

## Workstream

- ID: `catalog_trust`
- Alias: `R1`
- Branch candidate: `feature/trust-state-model`
- Status: `ready`

## Allowed Write Scope

- `backend/app/domain/**`
- `backend/app/services/**`
- `backend/app/api/**`
- `frontend/src/features/catalog/**`
- `docs/workflows/feature/trust-state-model/**`

## Required Contracts

- `Dataset`
- `DatasetStatus`
- `TrustGateResult`

## Mock/Fake Boundary

- quality, PII, and policy checks may use deterministic placeholders.
- Do not introduce real PII detection, external policy services, or secret-backed providers without `docs/14-decision-option-brief.md`.

## Deliverables

- dataset trust status path
- publish gate reason
- trust status manual verification evidence

## Validation Commands

- `scripts/validate-harness.sh`
- `scripts/validate-harness.sh --strict`
- workstream-specific tests TBD in branch `quality.md`

## Contract Changes

- Contract changes require updates to `.milestones/target-mvp/manifest.yaml`, `docs/03-interface-reference.md`, and branch `shared-docs.md`.

## Integration Notes

- Checkpoint: `spine_1`
- Depends on: `contract_baseline`

## Risks / Blockers

- Trust status drift with Query / Policy.
- Publish Gate semantics may need a Decision Option Brief if real policy logic is introduced.
