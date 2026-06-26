# M6 CatalogSource 경계 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M6 query service의 catalog 조회 경계를 바꾸는 작업이라, fixture 파일 의존을 끊는 회귀 테스트를 먼저 둔다.
- Failing test first: `test_week2_ai_query_uses_injected_catalog_source_for_evidence`
- Expected failure command/result: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` -> `1 failed, 4 passed`; `Week2AIQueryService.__init__()`가 `catalog_source` 인자를 받지 않는 실패 확인.
- Pass command/result: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` -> `5 passed in 0.34s`
- Refactor notes: `CatalogSource` protocol과 `FixtureCatalogSource` adapter를 추가하고, container에서 기본 fixture source를 주입한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | whitespace error 없음 |
| unit/focused test | `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` | passed | `5 passed in 0.34s` |
| integration/contract test | `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests -q` | passed | `37 passed in 0.76s` |
| build/typecheck | `python3 -m compileall backend/app` | passed | `Listing 'backend/app'...` 이하 compile 완료 |
| contract sample json | `jq -e . contracts/*.sample.json >/dev/null` | passed | 모든 sample JSON parse 성공 |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | 관련 draft/in-progress workspace skip 후 `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, PR 전/merge 전 원격 CI 확인 필요
- CI result: not run in this local pass
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: local API route smoke는 backend test suite의 Week2 route/service tests로 대체했다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| remote CI | feature branch push/PR 전 로컬 slice 검증 단계 | no |
| real M5 Catalog store/API source | 이번 범위는 M5 source로 교체 가능한 내부 경계 생성까지 | no |
| real DuckDB/Trino/Athena adapter | Week2 M6 현재 범위가 fake `SqlEngineAdapter` 유지 | no |
| external LLM/vector DB/full RAG | Week2 M6 범위 제외 | no |
