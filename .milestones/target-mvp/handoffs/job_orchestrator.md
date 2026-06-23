# Job / Orchestrator Handoff

## Workstream

- ID: `job_orchestrator`
- Alias: `R2`
- Branch candidate: `feature/control-plane-job-state`
- Status: `ready`

## Allowed Write Scope

- `backend/app/domain/**`
- `backend/app/services/**`
- `backend/app/ports/**`
- `docs/workflows/feature/control-plane-job-state/**`

## Required Contracts

- `JobRun`
- `TaskRun`
- `AuditEvent`

## Mock/Fake Boundary

- A synchronous in-memory runner is allowed.
- Do not introduce Kubernetes, external schedulers, queues, or production orchestration without a Decision Option Brief.

## Deliverables

- job/task state path
- audit event write path
- run/task manual verification evidence

## Validation Commands

- `scripts/validate-harness.sh`
- `scripts/validate-harness.sh --strict`
- workstream-specific tests TBD in branch `quality.md`

## Contract Changes

- Contract changes require updates to `.milestones/target-mvp/manifest.yaml`, `docs/03-interface-reference.md`, and branch `shared-docs.md`.

## Integration Notes

- Checkpoint: `spine_2`
- Depends on: `contract_baseline`
- Coordinate audit event semantics with Query / Policy and Recovery / Operate.

## Risks / Blockers

- Orchestration scope can expand quickly into infra work.
- Audit event shape may become a shared contract hotspot.
