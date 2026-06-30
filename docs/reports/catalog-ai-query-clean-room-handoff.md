# Catalog AI Query Clean-room Handoff 보고서

## Short Report / 짧은 보고

- Type: Phase
- Date: 2026-06-30
- Changed: Product Health Gold Run publish 후 AI Query가 같은 CatalogDataset/run/path를 참조하도록 handoff evidence를 보강했다.
- Verified: backend focused tests 11개, frontend build, `git diff --check`를 통과했다.
- Remaining: C-40 full browser demo smoke.
- Next context: 브라우저 smoke에서는 `/runs` Catalog 등록, `/catalog` path/run 확인, `/query` selected/evidence/retrieval/path 일치를 본다.
- Risk: remote CI와 browser click smoke는 아직 수행하지 않았다.

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/data-lake-runtime-stack`, `docs/workflows/feature/catalog-ai-query-clean-room-handoff`
- Date: 2026-06-30
- Workspace state: completed

## Implementation Summary / 구현 요약

- `AIQueryResult.evidence[].storage`를 추가했다.
- AI Query service가 CatalogMetadata storage를 evidence에 복사하게 했다.
- Product Health prepared Gold publish/query focused assertions에 selected dataset, evidence dataset, retrieval trace source, run id, local path 일치를 추가했다.
- AI Query evidence card가 local path를 표시한다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py backend/tests/test_target_dataset_local_materialization.py -q
npm --prefix frontend run build
git diff --check
```

## Regression Guard / 회귀 보호

- Checked feature: Catalog publish to AI Query clean-room handoff.
- Protected behavior: live CatalogDataset과 fixture/fallback path가 섞이지 않는다.
- Result: passed.

## Manual Verification / 수동 검증

- Document executed: C-39 manual verification 항목을 `docs/07-manual-verification-playbook.md`에 추가했다.
- Environment: local API/build validation.
- Result: focused automated checks passed.
- Failure/limitation: browser click smoke는 C-40에서 수행한다.
- Evidence: pytest/build/diff check passed.

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: C-40에서 실제 화면 조작으로 최종 데모 흐름과 UI 문구를 검수한다.
