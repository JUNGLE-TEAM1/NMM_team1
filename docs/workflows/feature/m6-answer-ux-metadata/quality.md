# M6 Answer UX Metadata 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: `AIQueryResult` public additive field와 M1 answer UX 표시를 바꾸는 backend/frontend contract 변경이다.
- Failing test first: `backend/tests/test_openai_llm_adapter.py`와 `backend/tests/test_week2_ai_query.py`에 provider/fallback/answer_metadata regression을 먼저 추가했다.
- Expected failure command/result: `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_openai_llm_adapter.py backend/tests/test_week2_ai_query.py -q` -> `7 failed, 18 passed`, missing `LLMAnswer.provider` and `AIQueryResult.answer_metadata`.
- Pass command/result: focused backend tests `30 passed`; full backend tests `114 passed, 1 skipped`; frontend build passed; browser desktop/mobile metadata panel smoke passed.
- Refactor notes: M6 summary text parsing 없이 UI가 provider/source/fallback/grounding state를 읽도록 `answer_metadata`를 추가했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | whitespace 오류 없음 |
| unit/focused test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_openai_llm_adapter.py backend/tests/test_week2_ai_query.py backend/tests/test_app_container.py -q` | passed | `30 passed in 0.61s` |
| integration/contract test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q`; `jq -e . contracts/*.sample.json` | passed | `114 passed, 1 skipped in 1.44s`; sample JSON parse 성공 |
| build/typecheck | `npm --prefix frontend run build`; `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m compileall -q backend/app` | passed | Vite build passed; backend app compile 성공 |
| browser smoke | In-app browser `/query` desktop + mobile 390px | passed | `Answer generation`, `template / template`, `grounded`, `evidence indexes: 0`; mobile panel/badge overflow false |
| harness validation | `scripts/validate-harness.sh` | not run separately | strict harness로 대체 |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: PR CI after push
- CI result: not run yet
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: no deployment. Browser smoke used local dev frontend/backend only; backend server was stopped after verification.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| live OpenAI key-backed smoke | 실제 `OPENAI_API_KEY`는 사용자가 나중에 채우기로 한 범위다. provider fallback metadata는 fake HTTP client test로 확인했다. | user confirmed key later in Step 9 |
