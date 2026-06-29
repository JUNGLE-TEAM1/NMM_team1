# M6 Answer UX Metadata 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m6-answer-ux-metadata`, `docs/workflows/feature/m6-answer-ux-metadata`
- Date: 2026-06-29
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/03`, `docs/05`, `docs/06`, `docs/07`, M6 AI query domain/service/adapters/tests, M1 `/query` UI.
- Escalated context read: browser skill for in-app UI smoke.
- Context omitted intentionally: live OpenAI key-backed execution, broad M1 redesign, Trino/vector DB docs.
- Changed: `AIQueryResult.answer_metadata`, `LLMAnswer` provider/fallback fields, OpenAI fallback metadata, M1 `/query` answer generation panel, sample contract, Source of Truth docs.
- Verified: TDD expected failure, focused backend tests `30 passed`, full backend tests `114 passed, 1 skipped`, `jq`, frontend build, browser desktop/mobile metadata smoke.
- Remaining: PR 생성/CI/merge는 아직 수행하지 않았다. 실제 OpenAI key-backed smoke는 후속 작업이다.
- Next context: `backend/app/domain/ai_query.py`의 `AnswerMetadata`, `frontend/src/app/App.jsx`의 `AnswerMetadataPanel`, `docs/03-interface-reference.md`의 answer metadata UX handoff.
- Risk: 현재 live provider quality는 검증하지 않았다. UI는 metadata를 표시하지만 provider 정책 자체는 M6 adapter/test 경계에 의존한다.
