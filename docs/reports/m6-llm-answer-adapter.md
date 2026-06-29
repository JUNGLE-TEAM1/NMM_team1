# M6 LLM Answer Adapter 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: M6 summary generation을 `LLMAdapter` port 뒤로 이동하고, deterministic `TemplateLLMAdapter`, safe `LLMAnswerContext`, blocked/unsupported no-adapter-call regression을 추가했다.
- Verified: TDD expected failure, focused M6/container tests `23 passed`, full backend tests `106 passed, 1 skipped`, `jq -e . contracts/*.sample.json`, `python -m compileall -q backend/app`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`.
- Remaining: PR 생성/CI/merge는 아직 수행하지 않았다. 실제 external LLM provider, API key/env, provider prompt 정책은 후속 Phase다.
- Next context: `docs/workflows/feature/m6-llm-answer-adapter/quality.md`, `docs/03-interface-reference.md`의 M6 LLM answer adapter boundary, 직전 report `docs/reports/m6-hybrid-route.md`.
- Risk: template summary는 deterministic MVP용이다. provider-backed 답변 품질, prompt 정책, secret/env 처리는 후속 결정이 필요하다.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m6-llm-answer-adapter`, `docs/workflows/feature/m6-llm-answer-adapter`
- Date: 2026-06-29
- Workspace state: ready-for-review

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/reports/m6-hybrid-route.md`

## Goal / 목표

- M6 답변 생성 로직을 외부 provider-ready adapter 경계 뒤로 이동하되, Week 2 기본값은 외부 호출 없는 deterministic template로 유지한다.

## Changed Files / 변경 파일

- `backend/app/domain/llm_answer.py`
- `backend/app/ports/llm_adapter.py`
- `backend/app/adapters/template_llm_adapter.py`
- `backend/app/services/ai_query.py`
- `backend/app/core/container.py`
- `backend/tests/test_week2_ai_query.py`
- `backend/tests/test_app_container.py`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/workflows/feature/m6-llm-answer-adapter/*`

## Implementation Summary / 구현 요약

- `LLMAnswerContext`는 question, route, intent, SQL result, rows, evidence, retrieval trace, guardrail만 담는다.
- `SqlEngineContext.local_fallback_path`, raw file, secret, credential, unauthorized column은 adapter context에 들어가지 않는다.
- 성공한 SQL/RAG/Hybrid 응답만 `LLMAdapter.generate_summary()`를 호출한다.
- blocked/unsupported 응답은 provider나 adapter 호출 없이 M6 내부 guardrail summary를 반환한다.
- `TemplateLLMAdapter`가 기존 summary 문구를 재현해 M1 public response shape를 유지한다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_week2_ai_query.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_app_container.py backend/tests/test_week2_ai_query.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q
jq -e . contracts/*.sample.json
python -m compileall -q backend/app
git diff --check
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m6-llm-answer-adapter/quality.md`
- Quality gate status: passed locally.
- TDD status: applied. Initial expected failure was missing `app.domain.llm_answer`; final focused result was `23 passed in 1.17s`.
- CI/check result: local checks passed; PR CI not run yet.
- Skipped checks: live external LLM smoke and live M1 browser smoke.
- CD/deploy gate: not applicable.

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/feature/m6-llm-answer-adapter/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: default deterministic `TemplateLLMAdapter`; blocked/unsupported no-adapter-call; real external LLM provider deferred.
- Revisit/rollback condition: if blocked answers call provider or unsafe context leaks, revert to service-local summary and add regression.

## Regression Guard / 회귀 보호

- Checked feature: M6 route behavior, summary generation, LLM context safety, default adapter.
- Protected behavior: existing `AIQueryResult.summary`, `sql`, `query_result`, `rows`, `evidence`, `route`, `retrieval_trace` response fields remain compatible.
- Result: focused/full backend regression passed locally.

## Failure Scenario / 실패 시나리오

- Reviewed failure: unsafe `local_fallback_path` or raw file data enters LLM context; blocked/unsupported answer calls adapter.
- Expected behavior: context contains only allowed SQL rows, evidence, retrieval trace; blocked/unsupported skips adapter.
- Verification: `backend/tests/test_week2_ai_query.py` LLM adapter tests.
- Result: passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07` M6 AI Query manual checklist reviewed; no source change kept in final PR because backend regression and `docs/06` cover unsupported/no external provider behavior.
- Environment: local backend tests, no external provider/API key.
- Result: backend response path remains deterministic and provider-free.
- Failure/limitation: live browser smoke not executed in this Phase.
- Evidence: quality commands above.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: M6 answer generation uses `LLMAdapter` with safe context and deterministic default; blocked/unsupported does not call adapter.
- Status: implemented for Step 8 local MVP.
- Evidence: docs and tests above.

## Document Updates / 문서 업데이트

- Updated: `docs/03`, `docs/05`, `docs/06`, branch workspace docs, report index.
- Not updated and why: `docs/02` architecture is unchanged because this is inside the existing M6 Ask/Evidence boundary. `README.md` remains external summary.

## Secret / Migration / Env Check

- Secret check: no secret committed; no API key or provider env var added.
- Migration/data change: no migration and no data storage change.
- Env change: no new required env var.

## Final Judgment / 최종 판단

- Done: Step 8 M6 LLM Answer Adapter implementation is locally complete and ready for PR decision.
- Remaining risk: real provider integration still needs provider selection, prompt policy, secret handling, and CI-safe tests.
