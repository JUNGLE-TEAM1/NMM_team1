# M6 LLM Answer Adapter 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M6 summary generation path와 LLM context 안전 경계를 바꾸는 backend core logic 변경이다.
- Failing test first: `backend/tests/test_week2_ai_query.py`에 injected `RecordingLLMAdapter`/`FailingLLMAdapter` regression을 먼저 추가했다.
- Expected failure command/result: `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_week2_ai_query.py -q` -> `ModuleNotFoundError: No module named 'app.domain.llm_answer'`.
- Pass command/result: focused M6/container tests `23 passed`; full backend tests `106 passed, 1 skipped`.
- Refactor notes: 기존 `Week2AIQueryService._summary()` 로직은 `TemplateLLMAdapter`로 이동했고, blocked summary만 service 내부에 남겼다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | whitespace 오류 없음 |
| unit/focused test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_app_container.py backend/tests/test_week2_ai_query.py -q` | passed | `23 passed in 1.17s` |
| integration/contract test | `PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q`; `jq -e . contracts/*.sample.json` | passed | `106 passed, 1 skipped in 2.12s`; sample JSON parse 성공 |
| build/typecheck | `python -m compileall -q backend/app` | passed | backend app compile 성공 |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: PR CI after push
- CI result: not run yet
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: no deployment. API public response fields remain backward-compatible.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| live external LLM smoke | 실제 provider/API key는 이번 scope 제외이며 기본 adapter는 외부 호출을 하지 않는다. | not needed |
| live M1 browser smoke | public `AIQueryResult.summary` shape 유지와 backend regression으로 대체했다. | not needed |
