# M6 OpenAI LLM Adapter 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M6 answer generation에 secret-backed external provider boundary를 추가하는 backend core/security 변경이다.
- Failing test first: `backend/tests/test_openai_llm_adapter.py`와 `backend/tests/test_app_container.py`에 OpenAI adapter safe request, fallback, provider selection regression을 먼저 추가했다.
- Expected failure command/result: `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_openai_llm_adapter.py backend/tests/test_app_container.py -q` -> `ModuleNotFoundError: No module named 'app.adapters.openai_llm_adapter'`.
- Pass command/result: focused adapter/container tests `9 passed`; focused M6/container tests `29 passed`; full backend tests `113 passed, 1 skipped`.
- Refactor notes: 기존 `TemplateLLMAdapter`는 기본값으로 유지했고, `OpenAILLMAdapter`는 `Settings`/`AppContainer`에서만 opt-in 선택된다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | whitespace 오류 없음 |
| unit/focused test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_openai_llm_adapter.py backend/tests/test_app_container.py -q` | passed | `9 passed in 0.48s` |
| integration/contract test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_openai_llm_adapter.py backend/tests/test_app_container.py backend/tests/test_week2_ai_query.py -q`; `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q`; `jq -e . contracts/*.sample.json` | passed | `29 passed in 0.78s`; `113 passed, 1 skipped in 1.53s`; sample JSON parse 성공 |
| build/typecheck | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m compileall -q backend/app` | passed | backend app compile 성공 |
| harness validation | `scripts/validate-harness.sh` | not run separately | strict harness로 대체 |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: PR CI after push
- CI result: not run yet
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: no deployment. Default provider remains template, so rollback is config/code revert only.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| live OpenAI provider smoke | 실제 `OPENAI_API_KEY`는 사용자가 나중에 채우기로 했고, 이번 Phase는 key 없이 code/config gate만 만드는 범위다. | user confirmed key later |
| live M1 browser smoke | public `AIQueryResult` response shape를 바꾸지 않고 backend regression으로 provider boundary를 확인했다. | not needed |
