# Source Connector Handoff

## Workstream

- ID: `source_connector`
- Alias: `R3`
- Branch candidate: `feature/source-expansion`
- Status: `ready`

## Allowed Write Scope

- `backend/app/adapters/**`
- `backend/app/ports/**`
- `backend/app/services/**`
- `docs/workflows/feature/source-expansion/**`

## Required Contracts

- `SourceConnection`
- `SchemaSnapshot`

## Mock/Fake Boundary

- A local fixture connector is allowed.
- Do not connect to real external services, production datasets, or secret-backed sources without a recorded decision and explicit human approval.

## Deliverables

- one selected non-baseline source connector
- schema discovery result
- connection success/failure evidence

## Validation Commands

- `scripts/validate-harness.sh`
- `scripts/validate-harness.sh --strict`
- workstream-specific tests TBD in branch `quality.md`

## Contract Changes

- Contract changes require updates to `.milestones/target-mvp/manifest.yaml`, `docs/03-interface-reference.md`, and branch `shared-docs.md`.

## Integration Notes

- Checkpoint: `spine_1`
- Depends on: `contract_baseline`
- Coordinate `SchemaSnapshot` shape with Catalog / Trust.

## Risks / Blockers

- Actual source choice is deferred.
- Real connector setup may introduce secret and license risk.
