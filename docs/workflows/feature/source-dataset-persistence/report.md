# Source dataset persistence 보고서

## Short Report / 짧은 보고

- Type: Feature Phase C-2
- Date: 2026-06-29
- Changed: `/api/source-datasets` create/list/read, SQLite `source_datasets` metadata table, Source Dataset wizard 저장, Target Dataset source picker API 후보 반영, Source Dataset contract/docs 추가.
- Verified: backend focused tests 13 passed, frontend build passed, `scripts/validate-harness.sh --strict` passed, `scripts/test-harness.sh` 31 passed, browser smoke passed.
- Remaining: PR 생성/CI 확인, C-3 Target Dataset + ETL job draft 저장.
- Next context: Source Dataset은 `metadata_ready` raw/source layer 정의이며 ingest/run/catalog publish는 후속 C-4~C-6로 분리한다.
- Risk: `/api/sources` CSV ingest 흐름과 `/api/source-datasets` metadata draft 흐름을 혼동하면 demo 설명이 흔들릴 수 있다.

---

## Phase / Hotfix

- Type: Feature Phase
- Branch/work location: `feature/source-dataset-persistence` / `/tmp/asklake-c2-source-dataset-persistence`
- Date: 2026-06-29
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/workflows/feature/external-connection-persistence/`

## Goal / 목표

- 등록된 External Connection에서 Source Dataset metadata를 저장하고 목록/상세 조회할 수 있게 한다.
- Target Dataset wizard가 저장된 Source Dataset metadata를 source 후보로 사용할 수 있게 한다.

## Changed Files / 변경 파일

- Backend: `backend/app/domain/schemas.py`, `backend/app/adapters/sqlite_metadata_store.py`, `backend/app/ports/metadata_store.py`, `backend/app/api/source_catalog.py`
- Frontend: `frontend/src/api/sourceDatasetApi.js`, `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`
- Tests/contracts/docs: `backend/tests/test_source_dataset_persistence.py`, `contracts/source_dataset.sample.json`, `docs/03`, `docs/05`, `docs/06`, `docs/07`, workspace docs

## Implementation Summary / 구현 요약

- `SourceDatasetCreate` / `SourceDatasetRecord` Pydantic contract를 추가했다.
- SQLite에 `source_datasets` table을 추가하고 create/list/get store method를 구현했다.
- `/api/source-datasets` POST/GET/GET by id endpoint를 추가했다.
- Source Dataset wizard Review에서 metadata 저장을 호출하고, 저장 성공 시 Target Dataset source selection에 같은 dataset을 반영했다.
- Source picker는 API 결과를 우선 사용하고 backend unavailable 시 기존 demo fallback을 유지한다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: Browser `control-in-app-browser`, Node REPL browser client
- Reason: local `/sources` UI flow와 API 저장 결과를 실제 브라우저에서 확인
- Impact: Source Dataset 저장 버튼, `/api/source-datasets` 응답, Target source picker 반영 확인

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read with targeted escalation for interface/schema/API impact
- Primary context read: `docs/08` C-2 queue, C-2 workspace docs, backend source/catalog/pipeline code, frontend Dataset wizard code
- Escalated context read: `docs/03`, `docs/05`, `docs/06`, `docs/07`, C-1 workspace handoff
- Context omitted intentionally: unrelated Week2 runtime implementation details beyond regression docs

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_source_catalog.py backend/tests/test_pipeline_run.py
npm run build
scripts/validate-harness.sh --strict
scripts/test-harness.sh
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/source-dataset-persistence/quality.md`
- Quality gate status: passed
- TDD status: partial; API contract test exists and passes, failing-first output was not preserved
- CI/check result: local checks passed including harness regression; remote CI pending until PR
- Skipped checks: full backend suite, captured failing-first log
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/feature/source-dataset-persistence/decisions.md`
- Decision status: mixed
- Accepted/deferred decisions: separate Source Dataset metadata API/table accepted; ingest/run/catalog publish deferred
- Revisit/rollback condition: if CatalogDataset becomes agreed source dataset store, migrate while preserving API response compatibility

## Regression Guard / 회귀 보호

- Checked feature: Source Dataset 생성이 ingest 실행처럼 보이는 경우
- Protected behavior: metadata 저장만 수행하고 connector test, file upload, Kafka consume, ETL run을 실행하지 않는다.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: Source Dataset 저장 중복 이름
- Expected behavior: `409 Source dataset name already exists`
- Verification: `backend/tests/test_source_dataset_persistence.py`
- Result: passed

## Manual Verification / 수동 검증

- Document executed: `docs/07` Dataset Module Source Dataset C-2 점검
- Environment: backend `127.0.0.1:8000`, frontend `127.0.0.1:13001`
- Result: Source Dataset 저장 성공, API response 확인, Target Dataset source step/picker 반영 확인
- Failure/limitation: browser smoke는 local SQLite demo metadata 기준
- Evidence: `/api/source-datasets` returned `layer=source`, `status=metadata_ready`, 5-column `schema_preview`

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Source Dataset metadata 생성/조회, Target Dataset source 후보 반영
- Status: passed locally
- Evidence: backend tests, browser smoke, docs/05 update

## Document Updates / 문서 업데이트

- Updated: `docs/03`, `docs/05`, `docs/06`, `docs/07`, `contracts/source_dataset.sample.json`, workspace docs
- Not updated and why: README unchanged because external project summary does not need C-2 implementation detail

## Failed / Incomplete / Follow-Up TODO

- Remote CI and PR review pending.
- C-3 must persist Target Dataset and ETL job draft; C-2 does not create jobs.

## Context For Next Phase / 다음 Phase 문맥

- C-3 should consume `/api/source-datasets` as Target Dataset input.
- Do not use `/api/sources` CSV ingest flow as the C-3 source list unless explicitly deciding to unify stores.

## Secret / Migration / Env Check

- Secret check: no secret values added
- Migration/data change: SQLite `source_datasets` table added via `CREATE TABLE IF NOT EXISTS`
- Env change: none

## Final Judgment / 최종 판단

- Done: yes, ready for PR
- Remaining risk: C-3 may need a decision on whether SourceDataset and CatalogDataset converge later
