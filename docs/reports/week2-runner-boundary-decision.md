# Week2 runner boundary decision 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-25
- Changed: M2 SparkRunner, M3 TransformSpec/job logic, M5 workflow runtime이 공유할 runner boundary를 결정했다.
- Verified: current runner code read, runner boundary keyword check, `git diff --check`, `scripts/validate-harness.sh --strict`
- Remaining: Phase 6 PR CI/merge 후 M2/M3/M5 병렬 구현 시작 가능
- Next context: runner input은 `workflow_definition`, `source_config`, `schema_definition`, optional `transform_spec`, optional `runtime_config`, `run_id`, `output_root`; output은 `Week2RunnerResult` 호환 shape다.
- Risk: docs-only decision이라 실제 interface는 후속 code PR에서 adapter-first로 구현해야 한다.

## Phase / Hotfix

- Type: docs
- Branch/work location: `docs/week2-runner-boundary-decision`, `docs/workflows/docs/week2-runner-boundary-decision`
- Date: 2026-06-25
- Workspace state: complete

## Goal / 목표

- M2/M3/M5가 병렬 구현을 시작할 수 있도록 runner input/output boundary와 소유권을 결정한다.

## Changed Files / 변경 파일

- `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/workflows/docs/week2-runner-boundary-decision/*`
- `docs/reports/week2-runner-boundary-decision.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- M5를 `WorkflowDefinition`/runner selection/`ExecutionResult` 호환 결과의 최종 소유자로 정했다.
- M3는 JSON profile/schema facts와 `TransformSpec`/job logic, M2는 `RuntimeConfig`/`SparkRunner` implementation을 맡도록 분리했다.
- `Week2RunnerResult` 호환 output shape를 Phase 6 boundary로 고정했다.

## Verification Commands / 검증 명령

```bash
sed -n '1,260p' backend/app/services/week2_local_runner.py
sed -n '1,260p' backend/app/services/week2_workflow.py
rg -n "Week2RunnerResult|WorkflowDefinition|ExecutionResult|RuntimeConfig|TransformSpec|SparkRunner|local_runner|M3가 Spark session|M2는 transformation semantics|runner selection" docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md
git diff --check
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/week2-runner-boundary-decision/quality.md`
- Quality gate status: passed
- TDD status: not applicable, docs-only decision
- CI/check result: local strict harness passed; PR CI는 PR 생성 후 확인
- Skipped checks: runtime unit/build checks skipped because no code changed
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/docs/week2-runner-boundary-decision/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: runner boundary accepted; concrete code adapter names can be decided in implementation PRs
- Revisit/rollback condition: 후속 M2/M3 implementation이 `Week2RunnerResult` 호환 결과를 만들 수 없으면 boundary를 재검토한다.

## Secret / Migration / Env Check

- Secret check: no secret added
- Migration/data change: none
- Env change: none

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: 병렬 구현 PR에서 실제 adapter/interface와 tests를 추가해야 한다.
