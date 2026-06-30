# Product Health Preset Synthesis 보고서

## Short Report / 짧은 보고

- Type: Phase
- Date: 2026-07-01
- Changed: Product Health preset 합성을 backend API와 Gold Dataset 화면 버튼으로 실행할 수 있게 했다.
- Verified: Backend focused test와 frontend build를 통과했다.
- Remaining: 전체 브라우저 클릭 검수와 C-40에서 발견된 demo polish gap은 후속 Phase/Hotfix로 남는다.
- Next context: 후속 Run/Catalog/AI Query 흐름은 이 preset 결과 artifact를 입력으로 사용할 수 있다.
- Risk: 이 Phase는 row-limited smoke synthesis이며 5GB evidence 재측정이나 production Spark/Airflow 실행이 아니다.

---

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/data-lake-runtime-stack`, `docs/workflows/feature/product-health-preset-synthesis`
- Date: 2026-07-01
- Workspace state: completed

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`

## Goal / 목표

- Product Health Demo preset을 사이트에서 실행해 `seed_product_mapping`, Silver parquet, Gold parquet, Catalog/Evidence 준비 파일을 재생성한다.

## Changed Files / 변경 파일

- `backend/app/api/source_catalog.py`
- `backend/app/domain/schemas.py`
- `backend/app/services/product_health_preset_synthesis.py`
- `backend/tests/test_product_health_preset_synthesis.py`
- `frontend/src/api/sourceDatasetApi.js`
- `frontend/src/app/App.jsx`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/reports/README.md`
- `docs/workflows/feature/product-health-preset-synthesis/*`

## Implementation Summary / 구현 요약

- `POST /api/product-health/preset-synthesis`를 추가했다.
- backend service가 기존 `scripts/product_health_synthetic_smoke.py`를 실행하고 parquet/json artifact evidence를 응답으로 반환한다.
- `/datasets/gold`에 Product Health preset 실행 panel을 추가해 Gold output, row count, ready artifact count, seed mapping path를 확인할 수 있게 했다.
- C-41 범위가 demo-only row-limited synthesis임을 interface/regression/manual verification 문서에 반영했다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: 없음
- Reason: 코드/문서 수정과 local test/build 중심 작업이다.
- Impact: 해당 없음

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/08-development-workflow.md` C-41, 관련 interface/manual/report index sections.
- Escalated context read: 없음
- Context omitted intentionally: 전체 문서 audit와 unrelated reports.

## Baseline Codebase Adoption / 기존 코드베이스 baseline 적용

- Current base commit: `98fa47a8`
- Existing run/build/test commands: `PYTHONPATH=backend ./.venv/bin/pytest`, `npm --prefix frontend run build`
- Existing CI/PR/branch policy: feature branch push/PR 가능, merge는 사람 확인 필요.
- Existing docs/code mapped: Product Health source inventory, existing synthetic smoke script, Gold Dataset 화면.
- Infrastructure gaps: Airflow/Spark production runner는 이 Phase 범위 밖이다.
- Deferred gaps and reason: Browser click smoke는 후속 검수 Phase에서 수행한다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_product_health_preset_synthesis.py -q
npm --prefix frontend run build
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_product_health_preset_synthesis.py backend/tests/test_product_health_source_inventory.py backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py -q
git diff --check
```

## Browser Smoke Evidence

- Backend: `http://127.0.0.1:18041`
- Frontend: `http://127.0.0.1:51741`
- Route: `/datasets/gold`
- Result: `Product Health Demo preset` panel visible; `Product Health preset 실행` click completed; panel showed `run_product_health_smoke_001`, `1000` rows, and `seed_product_mapping`.
- Console errors: none observed.

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/product-health-preset-synthesis/quality.md`
- Quality gate status: passed
- TDD status: focused backend test added
- CI/check result: local checks passed, including 13 related backend tests, frontend build, diff check, and browser smoke
- Skipped checks: none for C-41 local scope
- CD/deploy gate: not applicable

## Regression Guard / 회귀 보호

- Checked feature: Product Health preset synthesis boundary
- Protected behavior: preset synthesis가 범용 ETL/Airflow/Spark/5GB 재처리처럼 보이지 않는다.
- Result: passed by interface docs, regression guard, and response shape.

## Failure Scenario / 실패 시나리오

- Reviewed failure: Product Health preset synthesis가 missing artifact를 성공처럼 숨기는 경우.
- Expected behavior: artifact별 `status`와 path/row evidence를 반환한다.
- Verification: `backend/tests/test_product_health_preset_synthesis.py`
- Result: passed

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` C-41 항목.
- Environment: local backend `18041`, frontend `51741`.
- Result: passed.
- Failure/limitation: full cross-page clean-room demo smoke는 C-40 범위이며 여기서는 preset panel만 검수했다.
- Evidence: browser button click completed and console error log empty.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: C-41 Product Health Preset Synthesis
- Status: passed.
- Evidence: API test asserts `seed_product_mapping`, Silver parquet, Gold parquet, Catalog/Evidence artifact responses.

## Document Updates / 문서 업데이트

- Updated: `docs/03`, `docs/05`, `docs/06`, `docs/07`, `docs/reports/README.md`, workspace docs.
- Not updated and why: `docs/02` architecture는 새 infrastructure나 cross-service topology 변경이 없어 생략했다.

## Failed / Incomplete / Follow-Up TODO

- C-40에서 남은 demo polish gap 정리.

## Context For Next Phase / 다음 Phase 문맥

- C-41 결과는 후속 Run/Catalog/AI Query 검수에서 prepared Product Health artifact seed로 사용할 수 있다.
- `POST /api/product-health/preset-synthesis`는 demo-only local synthesis wrapper다.

## Secret / Migration / Env Check

- Secret check: raw credential 추가 없음.
- Migration/data change: metadata migration 없음. 실행 시 ignored local `data/local_sources/product_health/*` artifacts가 갱신된다.
- Env change: 없음.

## Final Judgment / 최종 판단

- Done: yes.
- Remaining risk: browser smoke와 demo polish는 후속 작업 필요.
