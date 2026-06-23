# Query / Policy Handoff

## Workstream

- ID: `query_policy`
- Alias: `R4`
- Branch candidate: `feature/query-policy-preflight`
- Status: `ready_with_mock`

## Allowed Write Scope

- `backend/app/domain/**`
- `backend/app/services/**`
- `backend/app/api/**`
- `frontend/src/features/**`
- `docs/workflows/feature/query-policy-preflight/**`

## Required Contracts

- `DatasetStatus`
- `PolicyDecision`
- `QueryExecution`

## Mock/Fake Boundary

- allow/deny/mask fixture policy is allowed.
- Do not use real policy engines, real unauthorized data, Trino, external query engines, or secret-backed providers without `docs/14-decision-option-brief.md`.

## Deliverables

- allow/deny/mask policy preflight
- query execution evidence reference
- denied path audit evidence

## Validation Commands

- `scripts/validate-harness.sh`
- `scripts/validate-harness.sh --strict`
- workstream-specific tests TBD in branch `quality.md`

## Contract Changes

- Contract changes require updates to `.milestones/target-mvp/manifest.yaml`, `docs/03-interface-reference.md`, and branch `shared-docs.md`.

## Integration Notes

- Checkpoint: `spine_2`
- Depends on: `contract_baseline`
- First wave candidate with Catalog / Trust, Source Connector, and Job / Orchestrator.

## Risks / Blockers

- Permission bypass risk if `DatasetStatus` and `PolicyDecision` are treated as UI-only checks.
- Real query engine selection is deferred.
