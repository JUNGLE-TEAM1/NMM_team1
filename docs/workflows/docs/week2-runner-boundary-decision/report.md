# Week2 runner boundary decision 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/week2-runner-boundary-decision`, `docs/workflows/docs/week2-runner-boundary-decision`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, ver2 README, Phase 5 M3 JSON decision, Phase 4 anchor
- Escalated context read: `backend/app/services/week2_local_runner.py`, `backend/app/services/week2_workflow.py`, `contracts/execution_result.sample.json`, `contracts/workflow_definition.sample.json`
- Context omitted intentionally: full runtime refactor audit
- Changed: added `runner-boundary-decision.md`, linked it from ver2 README, added Phase report/index, completed workspace evidence
- Verified: current runner code read, runner boundary keyword check, `git diff --check`, `scripts/validate-harness.sh --strict`
- Remaining: PR review/CI/merge, then parallel implementation can start
- Next context: M2 owns RuntimeConfig/SparkRunner, M3 owns TransformSpec/job logic, M5 owns runner selection and Week2RunnerResult-compatible persistence.
- Risk: code adapters are not implemented yet.
