# M5 Overview Demo Guide 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-29
- Changed: M5 담당자가 `/etl`과 product-health Airflow demo page를 보며 설명할 수 있도록 `m5-overview-demo-guide.md`를 추가했고, ver2 README/manual guide/report index/workspace evidence에 연결했다.
- Verified: M5 Source of Truth와 code path를 읽어 `ExecutionResult -> output -> CatalogMetadata.lineage` 흐름, status/fallback 해석, successful-only Catalog update 기준을 문서에 반영했다. Keyword/link/diff checks와 strict harness validation을 실행했다.
- Remaining: 실제 데모 리허설 결과와 사용자 질문 기반 Q&A는 후속 보강 대상이다.
- Next context: 설명 중 막히면 `docs/project-context/asklake-week2-module-plan/ver2/m5-overview-demo-guide.md`의 "코드 질문을 받았을 때" 표에서 시작한다.
- Risk: docs-only 변경이며 runtime behavior는 변경하지 않았다.

## Changed Files / 변경 파일

- `docs/project-context/asklake-week2-module-plan/ver2/m5-overview-demo-guide.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md`
- `docs/workflows/docs/m5-overview-demo-guide/*`
- `docs/reports/m5-overview-demo-guide.md`
- `docs/reports/README.md`

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: `plain-korean-teacher`
- Reason: 사용자가 M5 구현 흐름을 책임지고 설명할 수 있게 아주 기초적인 한국어 설명과 파일/함수 단위 흐름이 필요했다.
- Impact: 데모 화면에서 시작해 backend service/runner/catalog 흐름으로 내려가는 문서 구조를 사용했다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, Week2 ver2 README, existing M5 learning guide, latest related M5 reports.
- Escalated context read: `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `/etl` frontend code, product-health standalone page, M5 backend service/runner/adapter/store files, focused tests.
- Context omitted intentionally: unrelated M1/M2/M3/M4/M6 implementation internals, production deploy/AWS, full historical report audit.

## Verification Commands / 검증 명령

```bash
rg -n "M5|run_id|ExecutionResult|CatalogMetadata|Week2WorkflowService|product-health" docs/project-context/asklake-week2-module-plan/ver2/m5-overview-demo-guide.md
rg -n "m5-overview-demo-guide" docs/project-context/asklake-week2-module-plan/ver2/README.md docs/manual-verification/09-m5-demo-cockpit-learning-guide.md docs/reports/README.md
git diff --check
scripts/validate-harness.sh --strict
```

## Regression Guard / 회귀 보호

- Checked feature: M5 status/fallback interpretation and Catalog latest behavior.
- Protected behavior: `executor=airflow`의 fallback 성공을 Airflow 성공으로 설명하지 않고, 실패 run이 latest Catalog를 덮지 않는 기준을 문서화했다.
- Result: guide content matches `docs/06` M5 failure scenarios and focused tests.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` M5 sections reviewed; `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md` updated with overview link.
- Environment: docs-only review.
- Result: `/etl` and `frontend/product-health-airflow-demo.html` demo paths are both covered.
- Failure/limitation: browser smoke was not rerun because runtime/UI code did not change.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Week 2 M5 Airflow smoke, product-health Catalog smoke, product-health demo page acceptance.
- Status: documentation guide added; behavior not changed.
- Evidence: guide maps demo evidence to `ExecutionResult`, `CatalogMetadata`, `lineage.run_id`, `query.table_name`, metrics, logs.

## Secret / Migration / Env Check

- Secret check: no secret added.
- Migration/data change: none.
- Env change: none.

## Final Judgment / 최종 판단

- Done: yes.
- Remaining risk: actual spoken rehearsal may reveal missing Q&A details.
