# M6 Catalog RAG Index 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: retrieval index는 dataset 선택과 evidence trace에 영향을 주므로 ranking/safety/stale cache를 먼저 고정해야 한다.
- Failing test first: `backend/tests/test_catalog_retrieval_index.py`, `backend/tests/test_week2_ai_query.py`에 RAG-lite chunk/search/cache/trace regression을 먼저 추가했다.
- Expected failure command/result: `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_catalog_retrieval_index.py backend/tests/test_week2_ai_query.py -q` -> `ModuleNotFoundError: No module named 'app.adapters.local_embedding'`
- Pass command/result: `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_catalog_retrieval_index.py backend/tests/test_week2_ai_query.py -q` -> `17 passed in 0.64s`
- Refactor notes: `RetrievalIndex`/`EmbeddingAdapter` port 뒤에 local deterministic adapter와 `CatalogRetrievalIndex`를 두어 후속 external embedding/vector DB 교체 여지를 남겼다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| diff whitespace | `git diff --check` | passed | no output |
| unit/focused test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_catalog_retrieval_index.py backend/tests/test_week2_ai_query.py -q` | passed | `17 passed in 0.64s` |
| backend regression test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q` | passed | `88 passed, 1 skipped in 1.23s` |
| contract JSON | `jq -e . contracts/*.sample.json` | passed | all sample JSON parsed |
| build/typecheck | n/a | n/a | Python backend has no separate configured typecheck/build gate for this Phase |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: PR CI after PR creation
- CI result: not run locally
- Deploy/publish required: no
- Deployment confirmation: n/a
- Rollback/smoke notes: no deploy or migration. Revert this branch to remove the derived index behavior.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| live M1 browser smoke | 이번 Phase는 backend M6 retrieval index와 response trace만 변경하며 M1 UI 변경이 없다. | n/a |
| external vector DB / real embedding provider / external LLM smoke | 명시적 범위 제외. local deterministic adapter만 검증한다. | n/a |
