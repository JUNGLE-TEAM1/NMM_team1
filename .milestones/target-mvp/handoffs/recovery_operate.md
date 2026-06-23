# Recovery / Operate Handoff

## Workstream

- ID: `recovery_operate`
- Alias: `R6`
- Branch candidate: `feature/recovery-impact`
- Status: `ready_with_fixture`

## Allowed Write Scope

- `backend/app/domain/**`
- `backend/app/services/**`
- `backend/app/api/**`
- `frontend/src/features/**`
- `docs/workflows/feature/recovery-impact/**`

## Required Contracts

- `AssetImpact`
- `RecoveryAction`
- `JobRun`
- `AuditEvent`

## Mock/Fake Boundary

- schema drift and quality failure fixtures are allowed.
- Do not run real backfill, production recovery, or destructive data operations without explicit human approval and rollback notes.

## Deliverables

- impact summary
- retry/rerun/backfill record
- recovery audit evidence

## Validation Commands

- `scripts/validate-harness.sh`
- `scripts/validate-harness.sh --strict`
- workstream-specific tests TBD in branch `quality.md`

## Contract Changes

- Contract changes require updates to `.milestones/target-mvp/manifest.yaml`, `docs/03-interface-reference.md`, and branch `shared-docs.md`.

## Integration Notes

- Checkpoint: `spine_3`
- Depends on: `contract_baseline`
- Coordinate recovery event shape with Job / Orchestrator.

## Risks / Blockers

- Recovery actions can become destructive if they move beyond fixtures.
- Backfill semantics may require a separate decision.
