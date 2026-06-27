# M5 demo cockpit UI 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: target `feature/m5-demo-cockpit-ui`, actual `feature/m5-airflow-smoke-integration`, `docs/workflows/feature/m5-demo-cockpit-ui`
- Date: 2026-06-27
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/07-manual-verification-playbook.md`, M5 Airflow smoke workspace status, `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`, `frontend/src/api/week2Api.js`, `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`
- Escalated context read: `backend/app/api/week2_workflow.py`, `backend/app/services/week2_workflow.py`, `backend/app/services/week2_airflow_adapter.py`, contract samples for `ExecutionResult`, `WorkflowDefinition`, `CatalogMetadata`
- Context omitted intentionally: production Airflow deployment, MinIO/S3, SparkRunner/M2 implementation, M6 AI Query polish, full browser matrix
- Changed: `/etl` 화면을 정보 나열형에서 4개 필수 질문 중심 학습 흐름으로 재구성했다. 핵심 기능 요약, 4칸 flow map, 실행 console, 4개 판정 카드, 설명 가능한 3문장, 핵심 evidence table, Catalog lineage 확인, 필요 시 raw JSON 순서로 바꿨다. `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md`도 짧은 사용 가이드로 다시 작성했고, M5 기술 설명 보조 문맥으로 `m5-technical-depth-study-guide.md`를 연결했다.
- Verified: `npm run build`, `git diff --check`, `scripts/validate-harness.sh --strict`, `scripts/validate-harness.sh --integration`, source learning-flow check, guide content check. 리디자인 후 browser smoke에서 `local_runner 실행` 후 `run_reviews_demo_069`가 표시되고 Catalog lineage가 같은 run을 가리키며 browser error log가 0개임을 확인했다.
- Remaining: remote CI/PR review, Airflow executor click smoke는 후속 또는 M5 Airflow smoke branch evidence를 따른다.
- Next context: 이 화면은 M5 독립 학습/시연용이며, 현재 branch에서는 Airflow smoke와 함께 combined M5 local/demo PR 후보로 정리한다. 다음 UI slice는 `/catalog` detail live polish 또는 M6 query evidence 연결이다.
- Risk: actual branch가 `feature/m5-airflow-smoke-integration`이라 PR diff는 Airflow smoke와 M5 demo cockpit UI를 함께 포함한다. remote main이 앞서 있으므로 PR/sync 단계에서 충돌 여부를 다시 확인해야 한다.

## Regression Guard / 회귀 보호

- Checked feature: M5 demo page success/fallback interpretation
- Protected behavior: `fallback_succeeded`를 무조건 Airflow 실패로 설명하지 않고, `executor=local_runner`일 때 local fallback output 경로 성공으로 설명한다.
- Result: browser smoke에서 local runner 결과 해석이 `Local runner 경로가 성공했습니다`로 표시됨.

## Manual Verification / 수동 검증

- Document executed: local browser smoke before redesign, browser smoke after redesign, source learning-flow check after redesign, `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md`
- Environment: Vite `http://127.0.0.1:5173/etl`, FastAPI `http://127.0.0.1:8000`
- Result: M5 Demo page render, local runner execution `run_reviews_demo_069`, four verdict cards, output URI, Catalog lineage/schema/metrics/logs, raw JSON evidence displayed; browser error logs 0.
- Failure/limitation: Airflow executor click smoke는 이번 UI 검증에서 실행하지 않았다.

## Secret / Migration / Env Check

- Secret check: 새 secret 없음.
- Migration/data change: browser smoke가 `data/week2` local run output/metadata를 갱신할 수 있음.
- Env change: 없음.
