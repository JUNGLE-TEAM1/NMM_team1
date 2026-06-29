# M6 OpenAI LLM Adapter 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: M6 `LLMAdapter` 뒤에 env-gated `OpenAILLMAdapter`를 추가하고, `Settings`/`AppContainer`가 `WEEK2_LLM_PROVIDER=openai` + `OPENAI_API_KEY`가 있을 때만 선택하게 했다. 기본값은 계속 `TemplateLLMAdapter`다.
- Verified: TDD expected failure, adapter/container tests `9 passed`, M6 focused tests `29 passed`, full backend tests `113 passed, 1 skipped`, `jq -e . contracts/*.sample.json`, `python -m compileall -q backend/app`, `git diff --check`, `scripts/validate-harness.sh --strict`.
- Remaining: PR 생성/CI/merge는 아직 수행하지 않았다. 실제 `OPENAI_API_KEY`는 사용자가 나중에 환경 변수로 채운다.
- Next context: `docs/workflows/feature/m6-openai-llm-adapter/quality.md`, `backend/app/adapters/openai_llm_adapter.py`, `docs/03-interface-reference.md`의 M6 external LLM env contract.
- Risk: live provider latency/quality는 key 부재로 검증하지 않았다. provider 오류와 malformed response는 template fallback으로 보호한다.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m6-openai-llm-adapter`, `docs/workflows/feature/m6-openai-llm-adapter`
- Date: 2026-06-29
- Workspace state: ready-for-review

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`

## Goal / 목표

- M6의 답변 생성 경계에 실제 외부 LLM provider를 붙일 수 있는 adapter를 만들되, secret이 없으면 기존 Week 2 smoke가 그대로 동작하게 한다.

## Implementation Summary / 구현 요약

- `OpenAILLMAdapter`를 추가해 Responses API `/responses` request를 만들고 `output_text` 또는 nested output text를 `LLMAnswer(source="external")`로 변환한다.
- request body는 `LLMAnswerContext`의 허용된 `question`, `route`, `intent`, SQL rows, evidence, retrieval trace, guardrail만 사용한다.
- `Settings`에 `WEEK2_LLM_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`, `OPENAI_TIMEOUT_SECONDS` 계약을 추가했다.
- `AppContainer`는 provider가 `openai`이고 key가 있을 때만 `OpenAILLMAdapter`를 선택한다. key가 없으면 `TemplateLLMAdapter`를 유지한다.
- provider timeout/error/malformed output은 template fallback으로 처리한다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: Codex `openai-platform-api-key`, Codex `openai-docs`
- Reason: 외부 LLM provider와 API key boundary가 포함된 Phase다.
- Impact: plaintext secret을 읽거나 출력하지 않고, key는 나중에 사용자가 환경 변수로 채우는 결정으로 진행했다. OpenAI Responses API request boundary를 기준으로 adapter를 구현했다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read + provider/key boundary만 Escalate Read
- Primary context read: M6 interface/acceptance/regression/manual verification, M6 LLM adapter code/tests, settings/container.
- Escalated context read: OpenAI key/provider boundary.
- Context omitted intentionally: live OpenAI execution, production prompt tuning, Trino/vector DB docs, M1 UI internals.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_openai_llm_adapter.py backend/tests/test_app_container.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_openai_llm_adapter.py backend/tests/test_app_container.py backend/tests/test_week2_ai_query.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q
jq -e . contracts/*.sample.json
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m compileall -q backend/app
git diff --check
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m6-openai-llm-adapter/quality.md`
- Quality gate status: passed
- TDD status: applied; initial failure was `ModuleNotFoundError: No module named 'app.adapters.openai_llm_adapter'`
- CI/check result: local checks passed, PR CI not run yet
- Skipped checks: live OpenAI provider smoke, live M1 browser smoke
- CD/deploy gate: not applicable

## Regression Guard / 회귀 보호

- Checked feature: M6 LLM adapter safety and provider selection.
- Protected behavior: default template adapter, no external call without key, no secret/local path in request body, provider fallback.
- Result: passed.

## Failure Scenario / 실패 시나리오

- Reviewed failure: key missing, provider timeout/error, malformed response, unsafe prompt/request material.
- Expected behavior: template fallback or no external call.
- Verification: `backend/tests/test_openai_llm_adapter.py`, `backend/tests/test_app_container.py`, `backend/tests/test_week2_ai_query.py`
- Result: passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` M6 OpenAI LLM Adapter 점검 기준 반영.
- Environment: local backend tests with fake HTTP client, no live provider key.
- Result: passed by automated/manual-equivalent checks.
- Failure/limitation: live provider call not executed because user will fill `OPENAI_API_KEY` later.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: M6 answer generation uses `LLMAdapter` with allowed SQL rows/evidence/retrieval trace only; OpenAI adapter is opt-in and falls back safely.
- Status: satisfied locally.
- Evidence: focused/full backend tests and updated `docs/05`.

## Document Updates / 문서 업데이트

- Updated: `docs/03`, `docs/05`, `docs/06`, `docs/07`, this report, workspace evidence.
- Not updated and why: `contracts/*.sample.json` unchanged because public `AIQueryResult` shape did not change.

## Secret / Migration / Env Check

- Secret check: no key committed; no plaintext key printed; dummy test key appears only in test assertions and never in request body.
- Migration/data change: none.
- Env change: optional `WEEK2_LLM_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`, `OPENAI_TIMEOUT_SECONDS`.

## Final Judgment / 최종 판단

- Done: M6 Step 9 code/config/test/docs are ready for PR review.
- Remaining risk: live provider quality and latency need a later key-backed smoke after the user supplies `OPENAI_API_KEY`.
