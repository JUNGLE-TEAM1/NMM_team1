# M6 answer evidence grounding 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-26
- Branch/work location: `feature/m6-answer-evidence-grounding`, `docs/workflows/feature/m6-answer-evidence-grounding`
- Changed: `AIQueryResult.evidence`에 optional `table_name`, `schema_fields`, `metrics`, `lineage`, `retrieval_terms`를 추가하고, M6 summary가 selected CatalogMetadata의 dataset/run/row_count/schema 근거를 함께 말하도록 보강했다. `contracts/ai_query_result.sample.json`과 `docs/03-interface-reference.md`의 Week 2 AI Query evidence contract도 갱신했다.
- Verified: failing-first focused test 확인 후 `backend/tests/test_week2_ai_query.py` `8 passed`, latest-main merge 후 전체 backend tests `45 passed`, `python -m compileall backend/app`, `jq -e . contracts/*.sample.json`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: PR 생성 후 remote CI 확인과 merge/finalize/cleanup은 사람 확인이 필요하다.
- Next context: M1 AI Query Live UI는 기존 evidence 기본 필드와 함께 새 optional schema/metric/lineage/retrieval fields를 표시할 수 있다.
- Risk: optional field 추가라 기존 소비자는 깨지지 않지만, M1 UI가 새 필드를 렌더링할 때 null/empty defensive rendering이 필요하다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read, interface contract 변경 때문에 필요한 Week2/M6 문맥만 선택적으로 확장
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `docs/08-development-workflow.md`
- Escalated context read: `docs/project-context/asklake-week2-module-plan/ver2/README.md`, `main-e2e-path.md`, `revised-nonoverlap-responsibility.md`, `docs/reports/m6-m5-catalog-source-adapter.md`, `backend/app/services/ai_query.py`, `backend/app/domain/ai_query.py`, `backend/tests/test_week2_ai_query.py`
- Context omitted intentionally: real LLM provider, external vector DB/full document RAG, real SQL engine adapter, M1 UI implementation

## Implementation Summary / 구현 요약

- `QueryEvidence`에 CatalogMetadata grounding용 optional fields를 추가했다.
- `Week2AIQueryService`가 선택된 catalog의 schema fields, metric facts, lineage, retrieval terms를 evidence에 싣도록 변경했다.
- summary가 SQL 결과뿐 아니라 dataset, run id, output row count, schema 근거를 함께 말하도록 보강했다.
- M5 workflow run 이후 M6 AI query가 최신 catalog evidence를 확장 필드까지 사용하는 focused regression test를 추가했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q
PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests -q
/private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m compileall backend/app
jq -e . contracts/*.sample.json >/dev/null
git diff --check
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

## Acceptance / Regression / Manual Verification

- Acceptance: R5 Ask / Evidence의 "Ask 결과가 evidence 또는 보류 사유를 제공" 기준과 Week 2 AI Query contract를 연결했다.
- Regression: "Evidence 없는 AI 답변이 성공처럼 표시되는 경우"를 방지하기 위해 SQL result summary가 dataset/run/metric/schema 근거를 함께 반환하도록 테스트했다.
- Manual verification: `docs/07` Ask / Evidence 점검 중 "답변에 SQL, dataset, metric, freshness, lineage, retrieval trace evidence가 연결되는지" 항목을 backend API response 수준에서 확인했다.

## Secret / Migration / Env Check

- Secret check: secret, token, credential 변경 없음
- Migration/data change: DB migration 없음. API response optional fields와 fixture sample만 확장
- Env change: 없음

## Final Judgment / 최종 판단

- Done: M6 Week2 마지막 backend evidence grounding 보강은 local validation 기준 완료
- Remaining risk: M1 화면 표시와 remote CI는 PR 이후 확인 필요
