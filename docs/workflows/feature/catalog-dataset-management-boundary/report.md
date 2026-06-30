# CatalogDataset management boundary 보고서

## Short Report / 짧은 보고

- Type: Phase C-21
- Date: 2026-06-30
- Changed: registered CatalogDataset management policy API와 Gold Dataset read-only boundary panel을 추가했다.
- Verified: `backend/tests/test_target_dataset_catalog_publish.py`, frontend build.
- Remaining: metadata-only delete 구현, file delete, cascade delete, approval workflow는 후속 Phase다.
- Next context: C-22 credential/secret connection design.
- Risk: CatalogDataset 삭제/수정은 아직 지원하지 않는다. 현재는 정책 표시와 상세-only UI 경계 고정이다.

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/external-connection-persistence`, `docs/workflows/feature/catalog-dataset-management-boundary/`
- Date: 2026-06-30
- Workspace state: dirty worktree 위에서 C-21 관련 파일만 변경.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`

## Goal / 목표

- registered CatalogDataset을 metadata 관리 대상으로 열기 전에, detail/AI Query context와 delete/update/file delete/cascade delete 경계를 분리한다.
- output file evidence를 사람 확인 없이 삭제하지 않는 정책을 UI/API에서 확인 가능하게 한다.

## Changed Files / 변경 파일

- `backend/app/api/source_catalog.py`
- `backend/tests/test_target_dataset_catalog_publish.py`
- `frontend/src/api/catalogApi.js`
- `frontend/src/app/App.jsx`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py -q
npm run build
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/catalog-dataset-management-boundary/quality.md`
- Quality gate status: focused tests/build 통과.
- TDD status: management policy route와 disabled action contract를 backend test로 고정.
- Skipped checks: 실제 update/delete/file delete는 C-21 범위 밖.

## Regression Guard / 회귀 보호

- Checked feature: CatalogDataset management가 evidence file 삭제와 섞이는 경우.
- Protected behavior: allowed action은 detail/AI Query context이고 metadata update/delete, file delete, cascade delete는 disabled/deferred다.
- Result: API/UI에 read-only boundary로 반영.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` C-21 항목.
- Environment: focused backend tests와 frontend production build.
- Result: policy response와 Gold Dataset panel boundary 확인 가능.
- Failure/limitation: browser automation은 수행하지 않음.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: registered CatalogDataset read-only management boundary.
- Status: 구현/검증 완료.
- Evidence: backend focused tests, frontend build.

## Secret / Migration / Env Check

- Secret check: credential/secret 추가 없음.
- Migration/data change: 없음.
- Env change: 없음.

## Final Judgment / 최종 판단

- Done: C-21 CatalogDataset management boundary 표시 완료.
- Remaining risk: 후속으로 metadata-only delete를 구현할 때 AI Query context와 lineage reference 409 정책을 먼저 고정해야 한다.
