# M6 LLM Answer Adapter 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m6-llm-answer-adapter`, `docs/workflows/feature/m6-llm-answer-adapter`
- Date: 2026-06-29
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/03`, `docs/05`, `docs/06`, `docs/07`, 직전 M6 Step 7 report, M6 service/tests.
- Escalated context read: none
- Context omitted intentionally: external LLM provider docs/API key flow, Trino engine docs, M1 UI internals.
- Changed: M6 summary generation을 `LLMAdapter` port 뒤로 이동하고, deterministic `TemplateLLMAdapter`, safe `LLMAnswerContext`, blocked/unsupported no-adapter-call regression을 추가했다.
- Verified: TDD expected failure, focused M6/container tests `23 passed`, full backend tests `106 passed, 1 skipped`, `jq -e . contracts/*.sample.json`, `python -m compileall -q backend/app`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`.
- Remaining: PR 생성/CI/merge는 아직 수행하지 않았다. 실제 external LLM provider는 후속 Phase다.
- Next context: `docs/workflows/feature/m6-llm-answer-adapter/quality.md`, `docs/03-interface-reference.md`의 M6 LLM answer adapter boundary, 직전 report `docs/reports/m6-hybrid-route.md`.
- Risk: template summary는 deterministic MVP용이다. provider-backed 답변 품질, prompt 정책, secret/env 처리는 후속 결정이 필요하다.
