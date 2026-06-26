# M6 Catalog retrieval scoring 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: catalog 선택 로직을 바꾸는 core behavior라, 여러 catalog 후보에서 질문에 맞는 dataset을 고르는 실패 테스트를 먼저 둔다.
- Failing test first: `test_week2_ai_query_scores_catalog_metadata_terms_when_columns_tie`
- Expected failure command/result: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` -> `1 failed, 5 passed`; 기존 로직이 metadata/name 단서를 보지 못해 `dataset_generic_product_metrics`를 선택.
- Pass command/result: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` -> `6 passed in 0.31s`
- Refactor notes: `CatalogRetriever`를 추가해 column alias match와 metadata token match를 점수화하고, `Week2AIQueryService`는 retriever 결과의 catalog/reason terms만 소비한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | whitespace error 없음 |
| unit/focused test | `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` | passed | `6 passed in 0.31s` |
| integration/contract test | `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests -q` | passed | `38 passed in 0.86s` |
| build/typecheck | `python3 -m compileall backend/app` | passed | `catalog_retriever.py`, `ai_query.py` compile 완료 |
| contract sample json | `jq -e . contracts/*.sample.json >/dev/null` | passed | sample JSON parse 성공 |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, PR 전/merge 전 원격 CI 확인 필요
- CI result: not run in this local pass
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: local route/service smoke는 backend test suite로 대체했다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| remote CI | PR 생성 전 local validation 단계 | no |
| M5 real Catalog API/store adapter | 이번 범위는 M6 내부 retrieval scoring 분리까지 | no |
| external vector DB/full RAG/real LLM | Week2 M6 기본 범위 제외 | no |
| real SQL runtime | 이번 범위는 fake `SqlEngineAdapter` 유지 | no |
