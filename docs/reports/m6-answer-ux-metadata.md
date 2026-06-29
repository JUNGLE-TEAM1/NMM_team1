# M6 Answer UX Metadata 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: `AIQueryResult.answer_metadata`를 추가해 M1이 답변 source/provider/fallback/grounding state와 사용 evidence index를 summary text parsing 없이 표시할 수 있게 했다. M1 `/query` 화면에는 compact `Answer generation` panel을 추가했다.
- Verified: TDD expected failure, focused backend tests `30 passed`, full backend tests `114 passed, 1 skipped`, `jq -e . contracts/*.sample.json`, frontend build, browser desktop/mobile metadata panel smoke.
- Remaining: PR 생성/CI/merge는 아직 수행하지 않았다. live OpenAI key-backed UX smoke는 후속 작업이다.
- Next context: `backend/app/domain/ai_query.py`의 `AnswerMetadata`, `frontend/src/app/App.jsx`의 `AnswerMetadataPanel`, `docs/03-interface-reference.md`의 answer metadata UX handoff.
- Risk: live provider quality/latency는 검증하지 않았다. UI는 M6 metadata를 표시하며 provider policy를 재계산하지 않는다.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m6-answer-ux-metadata`, `docs/workflows/feature/m6-answer-ux-metadata`
- Date: 2026-06-29
- Workspace state: ready-for-review

## Goal / 목표

- M6 답변이 어떤 source/provider/fallback/grounding 상태로 생성됐는지 M1 UI가 직관적으로 표시할 수 있게 한다.

## Implementation Summary / 구현 요약

- `AnswerMetadata`를 `AIQueryResult` additive field로 추가했다.
- `LLMAnswer`에 provider/fallback 정보를 추가하고, `OpenAILLMAdapter` fallback reason을 보존했다.
- `Week2AIQueryService`가 성공/blocked/unsupported 경로별 answer metadata를 생성한다.
- `contracts/ai_query_result.sample.json`에 answer metadata 예시를 추가했다.
- M1 `/query` summary panel에 `Answer generation` compact strip을 추가하고 desktop/mobile overflow를 확인했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_openai_llm_adapter.py backend/tests/test_week2_ai_query.py backend/tests/test_app_container.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q
jq -e . contracts/*.sample.json
npm --prefix frontend run build
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m compileall -q backend/app
git diff --check
scripts/validate-harness.sh --strict
```

## Manual Verification / 수동 검증

- In-app browser `/query` desktop: RAG 질문 실행 후 `Answer generation`, `template / template`, `grounded`, `evidence indexes: 0` 표시 확인.
- In-app browser mobile 390px: metadata panel, summary panel, metadata badges overflow false 확인.
- Live OpenAI key-backed smoke는 실행하지 않았다.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: M6 `AIQueryResult.answer_metadata`와 Ask 화면 표시 기준.
- Status: satisfied locally.
- Evidence: backend regression, contract sample, frontend build, browser smoke.

## Regression Guard / 회귀 보호

- Checked feature: answer metadata와 UI 신뢰 상태 표시.
- Protected behavior: M1은 M6 metadata를 표시만 하고 route/scoring/provider policy를 재계산하지 않는다.
- Result: passed.

## Secret / Migration / Env Check

- Secret check: no secret committed. live `OPENAI_API_KEY` not used.
- Migration/data change: none.
- Env change: none.

## Final Judgment / 최종 판단

- Done: 10단계 로컬 구현과 검증 완료.
- Remaining risk: PR CI와 live provider UX smoke는 후속 단계.
