# M6 Catalog RAG Index 보고서

짧게 써도 되지만 변경 사항, 검증 결과, 남은 일, 다음 작업 문맥은 반드시 남긴다.

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-28
- Changed: M6에 CatalogMetadata 기반 RAG-lite index를 추가했다. `RetrievalIndex`/`EmbeddingAdapter` port, local deterministic embedding, safe metadata chunk, stale cache signature, `retrieval_trace` index hit 연결, 관련 contract/docs/tests를 포함한다.
- Verified: focused M6 tests `17 passed`, full backend tests `88 passed, 1 skipped`, `jq -e . contracts/*.sample.json`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`.
- Remaining: PR 생성/CI/merge는 아직 수행하지 않았다. `route=rag`, Hybrid route, external embedding/vector DB/LLM은 후속 Phase다.
- Next context: `docs/workflows/feature/m6-catalog-rag-index/quality.md`, `docs/03-interface-reference.md`의 M6 Catalog RAG-lite index boundary, 직전 report `docs/reports/m6-response-contract-trace.md`.
- Risk: local token embedding은 deterministic MVP smoke용이다. 실제 의미 검색 품질은 제한적이며 후속 provider는 `EmbeddingAdapter` 뒤에서 교체한다.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m6-catalog-rag-index`, `docs/workflows/feature/m6-catalog-rag-index`
- Date: 2026-06-28
- Workspace state: ready-for-review

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/reports/m6-response-contract-trace.md`

## Goal / 목표

- M6가 M5 CatalogMetadata를 읽기 전용으로 소비해 safe metadata chunk를 만들고, SQL-first 답변의 `retrieval_trace`에 schema/metric/lineage/catalog 근거를 더 자세히 남긴다.

## Changed Files / 변경 파일

- `backend/app/domain/retrieval_index.py`
- `backend/app/ports/embedding_adapter.py`
- `backend/app/ports/retrieval_index.py`
- `backend/app/adapters/local_embedding.py`
- `backend/app/services/catalog_rag_index.py`
- `backend/app/services/catalog_retriever.py`
- `backend/app/services/ai_query.py`
- `backend/app/core/container.py`
- `backend/tests/test_catalog_retrieval_index.py`
- `backend/tests/test_week2_ai_query.py`
- `contracts/ai_query_result.sample.json`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/workflows/feature/m6-catalog-rag-index/*`

## Implementation Summary / 구현 요약

- `CatalogRetrievalIndex`가 dataset identity, schema fields, metrics, lineage, query allowlist, freshness만 chunk로 만든다.
- `storage.local_fallback_path`, raw file path, secret, credential, API key로 보이는 scalar는 index text에서 제외한다.
- `dataset_id + lineage.run_id + updated_at` signature로 persisted index stale 여부를 판단한다.
- `CatalogRetriever`는 기존 keyword score에 index score를 더해 dataset 선택을 보강하되, 현재 route는 SQL-first로 유지한다.
- `Week2AIQueryService`는 기존 catalog trace 뒤에 index hit trace를 추가한다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read에서 시작, interface/data/security/quality 영향 때문에 필요한 Source of Truth만 추가 확인.
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/03`, `docs/05`, `docs/06`, `docs/07`, M6 responsibility context, previous M6 report.
- Escalated context read: `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`, `docs/reports/m6-response-contract-trace.md`.
- Context omitted intentionally: M1 UI 상세, external vector DB/LLM provider 문서, M2~M5 내부 구현 상세.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_catalog_retrieval_index.py backend/tests/test_week2_ai_query.py -q
PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests -q
jq -e . contracts/*.sample.json
git diff --check
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m6-catalog-rag-index/quality.md`
- Quality gate status: passed
- TDD status: applied. Initial expected failure was missing `app.adapters.local_embedding`; final focused result was `17 passed in 0.64s`.
- CI/check result: local checks passed; PR CI not run yet.
- Skipped checks: live M1 browser smoke, external vector DB/real embedding/LLM smoke.
- CD/deploy gate: not applicable.

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/feature/m6-catalog-rag-index/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: local deterministic embedding, safe metadata chunks only, optional persisted derived cache, SQL-first route 유지. external vector DB/real embedding/LLM/RAG-only route/M1 UI는 후속.
- Revisit/rollback condition: retrieval quality가 부족하면 `EmbeddingAdapter` 뒤에서 provider를 교체한다. cache stale/permission 문제가 있으면 in-memory mode 또는 cache path 설정으로 완화한다.

## Regression Guard / 회귀 보호

- Checked feature: M6 response contract, SQL-first route, DuckDB/fake SQL existing behavior.
- Protected behavior: 기존 `sql`, `query_result`, `rows`, `summary`, `evidence`는 유지하고 `retrieval_trace`만 richer evidence로 확장한다.
- Result: focused/backend regression passed.

## Failure Scenario / 실패 시나리오

- Reviewed failure: unsafe index data, stale cache, route/trace mismatch.
- Expected behavior: M6 index는 safe CatalogMetadata chunk만 사용하고 signature 변경 시 rebuild한다.
- Verification: `backend/tests/test_catalog_retrieval_index.py`, `backend/tests/test_week2_ai_query.py`.
- Result: passed.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: M6 Catalog RAG-lite index safe metadata chunk, retrieval trace evidence, derived cache stale rebuild.
- Status: implemented for Step 6 local MVP.
- Evidence: tests and docs/contract updates above.

## Document Updates / 문서 업데이트

- Updated: `docs/03`, `docs/05`, `docs/06`, `docs/07`, `contracts/ai_query_result.sample.json`, branch workspace docs.
- Not updated and why: `README.md`는 외부 요약이며 이번 내부 M6 Step 6 세부 구현을 담지 않는다. `docs/02` architecture는 기존 M6 RAG-lite boundary 안의 구현이라 별도 구조 변경이 아니다.

## Secret / Migration / Env Check

- Secret check: no secret committed. Index chunk excludes path/secret/credential/API-key-like scalar values.
- Migration/data change: no migration. Optional local persisted derived cache file path only.
- Env change: no new external env var or dependency.

## Final Judgment / 최종 판단

- Done: Step 6 M6 Catalog RAG Index implementation is locally complete and ready for PR review.
- Remaining risk: local embedding quality is MVP-level; real semantic embedding/vector DB/LLM integration remains later work.
