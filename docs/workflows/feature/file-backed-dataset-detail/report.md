# File-backed dataset detail 보고서

## Short Report / 짧은 보고

- Type: Phase C-16
- Date: 2026-06-30
- Changed: Source/Silver/Gold Dataset 응답에 read-side `file_evidence`를 추가하고 목록/상세 UI에서 `file-backed`, `missing file`, `metadata-only`를 구분했다.
- Verified: backend focused tests 29개, frontend build, Source/Silver/Gold browser smoke.
- Remaining: 실제 파일 삭제, row-level preview, ETL 실행은 후속 Phase 범위다.
- Next context: C-17 `feature/gold-build-local-materialization-alignment`에서 prepared Gold output과 local demo materializer 경계를 맞춘다.
- Risk: 현재 branch명이 C-16 workspace와 다르며 dirty worktree가 많다. PR 전 포함 파일을 반드시 선별해야 한다.

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/external-connection-persistence`, workspace `docs/workflows/feature/file-backed-dataset-detail/`
- Date: 2026-06-30
- Workspace state: completed, local dirty changes present

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`

## Goal / 목표

- Source/Silver/Gold Dataset detail이 실제 local file evidence와 metadata-only/missing 상태를 구분하게 한다.

## Changed Files / 변경 파일

- `backend/app/domain/schemas.py`
- `backend/app/api/source_catalog.py`
- `backend/app/services/dataset_file_evidence.py`
- `backend/tests/test_source_dataset_persistence.py`
- `backend/tests/test_silver_dataset_persistence.py`
- `frontend/src/app/App.jsx`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/workflows/feature/file-backed-dataset-detail/plan.md`
- `docs/workflows/feature/file-backed-dataset-detail/quality.md`

## Implementation Summary / 구현 요약

- `DatasetFileEvidence` schema를 추가하고 Source Dataset, Silver Dataset, Target Dataset draft record에 optional `file_evidence`를 붙였다.
- `dataset_file_evidence.py`에서 local file/folder/parquet metadata를 read-side로 검사한다.
- Source/Silver/Gold list와 detail modal에 `file-backed`, `missing file`, `metadata-only` 상태와 path/bytes/row/schema evidence를 표시한다.
- Source JSON/JSONL은 bytes와 `not_measured`를, Silver/Gold parquet는 parquet metadata row/schema를 표시한다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: Browser in-app browser skill, Node REPL browser control
- Reason: 실제 UI 클릭에서 Silver 상세가 빈 화면이 되는 런타임 문제를 검증해야 했다.
- Impact: Source/Silver/Gold 상세 modal이 실제로 열리고 evidence가 보이는 것을 확인했다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read에서 시작, interface/schema/UI/browser smoke로 Escalate Read
- Primary context read: `AGENTS.md`, C-16 plan, 관련 `docs/03/05/06/07/08` 섹션
- Escalated context read: App modal 주변 코드, schema/API tests
- Context omitted intentionally: 전체 문서 audit, 원격 PR/merge 상태 변경

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_silver_dataset_persistence.py backend/tests/test_target_dataset_draft_persistence.py -q
npm run build
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/file-backed-dataset-detail/quality.md`
- Quality gate status: passed
- TDD status: focused regression tests added for source missing/file-backed and silver prepared parquet evidence
- CI/check result: local only
- Skipped checks: full test suite, remote CI
- CD/deploy gate: not applicable

## Regression Guard / 회귀 보호

- Checked feature: Dataset detail evidence
- Protected behavior: missing/metadata-only dataset을 실제 파일처럼 표시하지 않는다.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: Silver detail click blank screen, missing file evidence
- Expected behavior: modal opens; file evidence status is explicit.
- Verification: browser smoke and focused tests
- Result: passed

## Manual Verification / 수동 검증

- Document executed: `docs/07` C-16 File-backed Dataset detail 점검
- Environment: backend `127.0.0.1:18000`, frontend `127.0.0.1:5173`
- Result: Source/Silver/Gold detail evidence 확인
- Failure/limitation: Gold draft 검증용 metadata를 local DB에 생성했다.
- Evidence: `source_product_catalog`, `silver_product_catalog`, `dataset_product_health`

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Source/Silver/Gold Dataset 상세 file-backed evidence
- Status: satisfied locally
- Evidence: backend tests, browser smoke

## Document Updates / 문서 업데이트

- Updated: `docs/03`, `docs/05`, `docs/06`, `docs/07`, C-16 workspace docs
- Not updated and why: `docs/08` C-16 row는 이미 존재해 내용 변경 불필요

## Failed / Incomplete / Follow-Up TODO

- Full test suite와 CI는 수행하지 않았다.
- PR 전 dirty worktree에서 C-16 포함 파일을 분리해야 한다.

## Context For Next Phase / 다음 Phase 문맥

- C-17은 prepared Gold parquet와 local demo materializer output의 경계를 정리한다.
- 이번 Phase의 `file_evidence`는 read-side evidence이며 ETL 실행 또는 file lifecycle 관리는 아니다.

## Secret / Migration / Env Check

- Secret check: credential/secret 추가 없음
- Migration/data change: schema migration 없음. local metadata DB에 browser smoke용 Silver/Gold metadata 생성
- Env change: 없음

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: branch/workspace mismatch와 dirty worktree 선별 필요
