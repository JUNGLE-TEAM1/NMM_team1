# Full Browser Demo Smoke 보고서

## Short Report / 짧은 보고

- Type: Phase
- Date: 2026-07-01
- Changed: C-40 브라우저 클릭 검수를 수행하고 성공 경로와 남은 gap을 분류했다.
- Verified: Source -> Silver -> Gold -> Job Run -> Catalog -> AI Query 흐름을 실제 브라우저와 API evidence로 확인했다.
- Remaining: 데모 전 Hotfix 후보는 stale server/proxy preflight, 중복 실패 escape CTA, 오래된 Phase 문구, 중복 데이터 정리/최신 강조다.
- Next context: 기능 핵심은 통과했지만 데모 안정성을 위해 findings 중 High/Medium을 먼저 고치는 것이 좋다.
- Risk: 검수 환경에 기존 smoke 데이터가 많이 남아 있어 clean demo 기준은 별도 reset/seed 전략이 필요하다.

---

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/data-lake-runtime-stack`, `docs/workflows/feature/full-browser-demo-smoke`
- Date: 2026-07-01
- Workspace state: completed

## Goal / 목표

- 브라우저에서 실제로 클릭하면서 `연결 -> Source -> Silver -> Gold -> Run -> Catalog -> AI Query` 전체 흐름이 데모 가능한지 검수한다.

## Browser Flow Result / 브라우저 흐름 결과

- Source Dataset 생성: passed. Product Health source inventory가 보이고 `source_user_events` 저장 후 목록으로 복귀했다.
- Silver Dataset 생성: passed. `source_user_events`에서 `silver_user_events` 저장 후 목록으로 복귀했다.
- Gold Dataset 생성: partial. 기존 `dataset_product_health` draft가 있어 중복 저장은 정상 차단됐으나 실패 후 목록 복귀 CTA가 부족했다.
- Gold Build Job: passed after refresh. `Build dataset_product_health`에서 queued run 생성 가능.
- Run execution: passed. Run `5b504b44-38cf-4a7b-a35f-3b9968faaeaf`가 `prepared_gold_reference`로 succeeded 전환됐다.
- Catalog publish: passed. CatalogDataset `8854ade0-a0c8-4788-9dd2-89bd954dc8f0`가 같은 run/path를 가리킨다.
- AI Query: passed. 질문 결과가 same catalog/run/path evidence를 표시하고 console error 없이 렌더링됐다.

## Key Evidence / 핵심 증거

- Run id: `5b504b44-38cf-4a7b-a35f-3b9968faaeaf`
- CatalogDataset id: `8854ade0-a0c8-4788-9dd2-89bd954dc8f0`
- Gold path: `data/local_sources/product_health/gold/gold_product_health.parquet`
- Run mode: `prepared_gold_reference`
- Row count: `1000`
- AI Query answer: `aph_prod_000006 상품은 위험 점수 88.23로 우선 확인 대상입니다.`

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py backend/tests/test_product_health_source_inventory.py -q
npm --prefix frontend run build
git diff --check
curl -sS http://127.0.0.1:8000/api/target-dataset-job-runs/5b504b44-38cf-4a7b-a35f-3b9968faaeaf
curl -sS http://127.0.0.1:8000/api/week2/ai/query -H 'Content-Type: application/json' -d '{"question":"품질 위험 점수가 높은 상품을 보여줘"}'
```

## Findings / 발견 이슈

| Severity | Finding | Suggested next action |
| --- | --- | --- |
| High | stale backend/Vite proxy 조합이면 Source inventory가 404로 보여 첫 단계가 막힌다. | demo preflight 또는 start script 추가. |
| Medium | Gold 중복 저장 실패 후 목록/기존 draft 이동 CTA가 없다. | Hotfix로 escape CTA 추가. |
| Medium | Gold/Jobs에 “다음 Phase에서 실행 연결” 같은 오래된 문구가 남아 있다. | C-38 이후 wording으로 교체. |
| Medium | 기존 smoke 데이터가 많아 최신 Product Health 결과와 과거 결과가 섞여 보인다. | clean demo reset 또는 최신 run 강조. |
| Low | Silver Review schema preview가 field명 대신 source명을 반복 표시한다. | schema preview mapping 수정. |
| Low | Gold Build Jobs가 첫 진입에서 비어 보이고 refresh 후 표시됐다. | 부분 로딩/refresh state 개선. |

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/full-browser-demo-smoke/quality.md`
- Quality gate status: passed-with-findings
- Browser smoke: completed.
- Console errors: none observed.
- CI/check result: local checks passed.

## Regression Guard / 회귀 보호

- Checked feature: Full demo click-through and evidence consistency.
- Protected behavior: 화면 성공과 실제 run/catalog/query evidence가 어긋나지 않는다.
- Result: passed with UX findings.

## Manual Verification / 수동 검증

- Document executed: `docs/workflows/feature/full-browser-demo-smoke/plan.md`, `docs/07-manual-verification-playbook.md` C-39/C-40 관련 흐름.
- Environment: local backend `8000`, frontend `5173`.
- Result: core path passed.
- Failure/limitation: clean demo reset은 수행하지 않았다.
- Evidence: browser DOM/screenshot/API outputs.

## Final Judgment / 최종 판단

- Done: yes, as verification Phase.
- Remaining risk: 데모 안정성을 위해 High/Medium findings를 Hotfix로 먼저 처리하는 것이 좋다.
