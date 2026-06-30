# Catalog AI Query Clean-room Handoff 보고서

## Short Report / 짧은 보고

- Type: Phase
- Date: 2026-06-30
- Changed: Product Health Gold Run publish 뒤 AI Query가 같은 CatalogDataset/run/path를 근거로 사용하도록 C-39 handoff를 보강했다.
- Verified: backend focused tests, frontend build, diff whitespace check를 통과했다.
- Remaining: C-40에서 실제 브라우저 클릭으로 Connection -> Source -> Silver -> Gold -> Run -> Catalog -> AI Query 흐름을 검수한다.
- Next context: AI Query evidence의 `storage.local_fallback_path`와 `run_id`, `retrieval_trace.source_id`를 C-40 smoke 기준으로 사용한다.
- Risk: full browser click smoke는 아직 수행하지 않았다.

---

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/data-lake-runtime-stack`, `docs/workflows/feature/catalog-ai-query-clean-room-handoff`
- Date: 2026-06-30
- Workspace state: completed

## Goal / 목표

- C-38에서 실행한 Product Health Gold 결과를 CatalogDataset으로 등록하고, AI Query가 같은 CatalogDataset을 읽게 한다.

## Changed Files / 변경 파일

- `backend/app/domain/ai_query.py`
- `backend/app/services/ai_query.py`
- `backend/tests/test_ai_query_dataset_context.py`
- `backend/tests/test_target_dataset_catalog_publish.py`
- `frontend/src/app/App.jsx`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- `AIQueryResult.evidence[]`에 `storage`를 추가해 CatalogDataset storage/local path를 Query evidence에서 직접 확인할 수 있게 했다.
- Product Health prepared Gold publish 뒤 AI Query selected dataset, evidence, retrieval trace, run id, local path가 같은 CatalogDataset/run을 가리키는 focused regression을 추가했다.
- AI Query evidence card에 local path를 표시해 UI에서도 Catalog/Run handoff를 확인할 수 있게 했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py backend/tests/test_target_dataset_local_materialization.py -q
npm --prefix frontend run build
git diff --check
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/catalog-ai-query-clean-room-handoff/quality.md`
- Quality gate status: passed
- TDD status: focused regression updated before implementation.
- CI/check result: local checks passed.
- Skipped checks: browser full click smoke deferred to C-40.
- CD/deploy gate: not applicable.

## Regression Guard / 회귀 보호

- Checked feature: CatalogDataset publish to AI Query context handoff.
- Protected behavior: selected dataset, evidence, retrieval trace, run id, SQL table, local path가 fixture/live 사이에서 섞이지 않는다.
- Result: passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` C-39 항목 추가.
- Environment: local API/build validation.
- Result: focused automated checks passed.
- Failure/limitation: browser click smoke는 C-40에서 수행한다.
- Evidence: pytest/build/diff check output.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: `C-39 Catalog AI Query Clean-room Handoff`
- Status: passed for API/build scope.
- Evidence: AI Query evidence includes `storage.local_fallback_path` matching published CatalogDataset/run output path.

## Secret / Migration / Env Check

- Secret check: raw credential 추가 없음.
- Migration/data change: API response schema additive field only. DB migration 없음.
- Env change: 없음.

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: C-40 browser full smoke에서 실제 화면 클릭과 오래된 mock/seed 흔적을 검수해야 한다.
