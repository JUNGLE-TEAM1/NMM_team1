# Target dataset run handoff 보고서

## Short Report / 짧은 보고

- Type: Feature Phase
- Date: 2026-06-29
- Changed: Target Dataset run handoff API, SQLite run link 저장소, frontend `Job Runs` 패널, fixture-backed smoke 표시, contract/docs를 추가했다.
- Verified: backend focused tests 8 passed, frontend build passed, browser/API smoke passed, harness strict/regression passed.
- Remaining: PR 생성 후 remote CI 확인, merge는 사람 확인 필요.
- Next context: C-5는 `TargetDatasetRun.execution_result`에 M2/M4 runtime evidence를 정렬한다.
- Risk: C-4 run은 Week2 fixture-backed local runner handoff이며 Spark/Kafka runtime evidence 보강이나 CatalogMetadata final integration은 아직 아니다.

---

## Phase / Hotfix

- Type: Feature Phase
- Branch/work location: `feature/target-dataset-run-handoff` / `/tmp/asklake-c4-target-dataset-run-handoff`
- Date: 2026-06-29
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`

## Goal / 목표

- 저장된 Target Dataset `job_definition` draft를 Week2/M5 workflow run 생성으로 handoff한다.
- 화면에서는 독립 `M5 데모`가 아니라 Target Dataset Review의 `Job Runs`로 run id/status를 표시한다.

## Implementation Summary / 구현 요약

- `/api/target-datasets/{dataset_id}/runs` `POST/GET`와 `/api/target-dataset-runs/{run_record_id}` `GET`를 추가했다.
- `target_dataset_runs` SQLite table에 Target Dataset, Week2 run id, executor, status, `job_definition`, `execution_result`를 저장한다.
- `execution_result.target_dataset_handoff`에 Target Dataset context와 `runtime_output_scope=week2_fixture_output`를 보존한다.
- Target Dataset Review 저장 후 `Job Runs` 패널에서 `Job Run 시작`을 누르면 목록 API를 다시 조회하고 run status와 fixture output scope를 표시한다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: Browser plugin `control-in-app-browser`
- Reason: frontend wizard 저장 후 run handoff flow를 실제 로컬 화면에서 검증하기 위해 사용했다.
- Impact: `/dataset`에서 draft 저장 후 `Job Run 시작`, `run_reviews_demo_002`, `fallback succeeded`, `fixture output dataset_reviews_gold` 표시를 확인했다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read, C-4 API/UI/data 영향으로 관련 sections만 Escalate Read
- Primary context read: `AGENTS.md`, `docs/08` Dataset Module Connection Queue, C-4 workspace docs, backend/frontend TargetDataset/Week2 workflow 관련 파일
- Escalated context read: `docs/03`, `docs/05`, `docs/06`, `docs/07`
- Context omitted intentionally: 무관한 historical reports와 C-5 이후 Spark/Kafka/Catalog deep implementation docs

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend pytest backend/tests/test_target_dataset_run_handoff.py backend/tests/test_target_dataset_job_draft.py backend/tests/test_week2_workflow_catalog.py::test_week2_workflow_run_returns_execution_result_contract backend/tests/test_week2_workflow_catalog.py::test_week2_catalog_metadata_tracks_successful_run_lineage
cd frontend && npm ci && npm run build
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/target-dataset-run-handoff/quality.md`
- Quality gate status: passed locally for C-4 focused scope
- TDD status: backend target dataset run handoff tests added
- CI/check result: local focused checks passed; remote CI pending after PR
- Skipped checks: full Week2 spark runner local test failed in this environment and is outside C-4 local_runner handoff scope
- CD/deploy gate: not required

## Regression Guard / 회귀 보호

- Checked feature: Target Dataset run handoff가 M5 데모 화면으로 되돌아가는 경우
- Protected behavior: run 생성은 Target Dataset `Job Runs` 패널에서만 노출하고 Week2 fixture output을 실제 Target output처럼 표시하지 않는다.
- Result: passed by UI copy, route placement, browser smoke

## Manual Verification / 수동 검증

- Document executed: `docs/07` Dataset Module Target Dataset C-4 점검
- Environment: backend `127.0.0.1:8000`, frontend `127.0.0.1:13003`
- Result: Source Dataset 선택, Target draft 저장, `Job Run 시작`, `run_reviews_demo_002`, `fallback succeeded`, `fixture output dataset_reviews_gold` 표시 확인
- Evidence: `/api/target-datasets/{dataset_id}/runs` 응답에 `execution_result.target_dataset_handoff.runtime_output_scope=week2_fixture_output` 확인

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Trusted Dataset acceptance의 Target Dataset Job Run 생성/status 기준
- Result: C-4 범위 기준 충족
