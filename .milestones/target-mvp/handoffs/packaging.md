# Packaging Handoff

## Workstream

- ID: `packaging`
- Alias: `R7`
- Branch candidate: `feature/packaging-dev-lite`
- Status: `ready`

## Allowed Write Scope

- `infra/**`
- `docker-compose.yml`
- `scripts/**`
- `docs/workflows/feature/packaging-dev-lite/**`

## Required Contracts

- `ModuleHealth`

## Mock/Fake Boundary

- local/container dev-lite profiles are allowed.
- Do not add production cloud resources, remote deploy targets, or real secrets without a Decision Option Brief.

## Deliverables

- local/container health check
- secret/config validation
- dev-lite smoke evidence

## Validation Commands

- `scripts/validate-harness.sh`
- `scripts/validate-harness.sh --strict`
- workstream-specific smoke test TBD in branch `quality.md`

## Contract Changes

- Contract changes require updates to `.milestones/target-mvp/manifest.yaml`, `docs/03-interface-reference.md`, and branch `shared-docs.md`.

## Integration Notes

- Checkpoint: `release`
- Depends on: `contract_baseline`
- Should follow the early product path unless explicitly selected for infra-first work.

## Risks / Blockers

- Packaging can pull the team into deployment scope before MVP behavior is stable.
- Secret/config validation must not commit real credentials.
