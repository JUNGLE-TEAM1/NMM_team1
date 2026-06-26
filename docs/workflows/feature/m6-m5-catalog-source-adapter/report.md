# M6 M5 CatalogSource adapter 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m6-m5-catalog-source-adapter`, `docs/workflows/feature/m6-m5-catalog-source-adapter`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Lite Read, M5/M6 integration boundary 확인을 위해 필요한 Week2 ver2/M6 workspace 문맥만 선택적으로 확장
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`, `docs/15-context-budget-rule.md`, 이 workspace `plan.md`
- Escalated context read: `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`, `existing-implementation-anchor.md`, `runner-boundary-decision.md`, 이전 M6 `m6-catalog-source-boundary`/`m6-catalog-retrieval-scoring` report/plan, `backend/app/services/week2_catalog_store.py`, `backend/app/services/week2_workflow.py`, `backend/app/core/container.py`, `backend/app/services/ai_query.py`, `backend/tests/test_week2_ai_query.py`
- Context omitted intentionally: M3 TransformSpec 세부 구현, real DuckDB/Trino/Athena adapter, external vector DB/full document RAG/real LLM, M1 UI binding
- Changed: `Week2CatalogStoreSource` adapter 추가, app container에서 M5 workflow service와 M6 AI query service가 같은 `Week2CatalogStore`를 공유하도록 wiring, workflow run 이후 AI query가 최신 M5 catalog evidence를 사용하는 regression test 추가
- Verified: focused M6 test `7 passed`, backend tests `39 passed`, `python -m compileall backend/app`, `jq -e . contracts/*.sample.json`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: PR #149 merge commit push, 원격 CI/PR 검증, real SQL runtime adapter, M3 schema/profile facts 추가 반영
- Next context: 다음 M6 구현은 real SQL runtime adapter 또는 M3 schema/profile facts 기반 evidence 보강을 검토한다. M5 store shape가 pagination/auth/session context를 요구하면 `CatalogSource` protocol 확장을 먼저 결정한다.
- Risk: workflow run 전 AI query는 기존 fixture fallback을 계속 사용한다. 발표 흐름에서 반드시 workflow run 후 query를 사용해야 최신 M5 catalog evidence가 보장된다.

## Goal / 목표

- M6 `Week2AIQueryService`가 fixture catalog만 보지 않고 M5 `Week2CatalogStore`에 저장된 최신 `CatalogMetadata`를 `CatalogSource`로 소비하게 한다.

## Changed Files / 변경 파일

- `backend/app/adapters/week2_catalog_store_source.py`
- `backend/app/core/container.py`
- `backend/tests/test_week2_ai_query.py`
- `docs/workflows/feature/m6-m5-catalog-source-adapter/*`
- `docs/reports/m6-m5-catalog-source-adapter.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- `Week2CatalogStoreSource`를 추가해 `Week2CatalogStore.load_catalog()` 결과를 M6 `CatalogSource` protocol로 노출했다.
- app container에서 `Week2CatalogStore`를 한 번 만들고 M5 `Week2WorkflowService`와 M6 `Week2AIQueryService`가 공유하게 했다.
- catalog store가 비어 있으면 기존 `FixtureCatalogSource` fallback을 유지한다.
- workflow run을 두 번 실행한 뒤 AI query가 `run_reviews_demo_002` evidence를 반환하는 route regression test를 추가했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q
PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests -q
/private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m compileall backend/app
jq -e . contracts/*.sample.json >/dev/null
git diff --check
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m6-m5-catalog-source-adapter/quality.md`
- Quality gate status: passed locally
- TDD status: applied. 새 test가 먼저 `run_reviews_demo_001` fixture evidence를 반환하며 실패했고, adapter/wiring 후 통과했다.
- CI/check result: local focused/backend/compile/contract/diff/harness checks passed; remote CI pending PR
- Skipped checks: container smoke skipped because route-level backend integration test covers this adapter slice
- CD/deploy gate: not required

## Regression Guard / 회귀 보호

- Checked feature: Week2 M5 workflow/catalog -> M6 AI query evidence path
- Protected behavior: 실패/미실행 catalog를 성공 evidence처럼 쓰지 않고, successful M5 catalog가 있으면 fixture보다 우선한다.
- Result: `test_week2_ai_query_uses_latest_m5_catalog_after_workflow_runs`와 기존 fixture/SQL guardrail tests 통과

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` Target MVP Ask/Evidence 항목 중 evidence 연결 기준을 자동 route test로 대체 확인
- Environment: local macOS, Python 3.14 venv `/private/tmp/nmm_team1_m6_adapter_py314_venv`
- Result: workflow run -> catalog store -> AI query evidence path 확인
- Failure/limitation: Docker/container smoke는 실행하지 않음
- Evidence: `backend/tests/test_week2_ai_query.py`

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Query/Ask 결과는 evidence와 연결된다; Evidence는 사용 dataset, freshness, lineage를 포함한다.
- Status: partial passed for Week2 M6 RAG-lite path
- Evidence: AI query route response evidence uses latest M5 catalog `run_id` and `s3_uri`

## Document Updates / 문서 업데이트

- Updated: branch workspace evidence, `docs/reports/m6-m5-catalog-source-adapter.md`, report index
- Not updated and why: `docs/02`, `docs/03`, `docs/05`, `docs/06`, `docs/07`은 기존 contract 안의 내부 adapter 변경이라 수정하지 않는다.

## Secret / Migration / Env Check

- Secret check: no secret added
- Migration/data change: no schema migration; runtime test writes temp result/catalog files only
- Env change: no committed env change; temporary venv used for local validation

## Final Judgment / 최종 판단

- Done: local implementation done; PR checks pending
- Remaining risk: M5 store가 나중에 pagination/auth/session context를 요구하면 `CatalogSource` protocol 확장이 필요할 수 있다.
