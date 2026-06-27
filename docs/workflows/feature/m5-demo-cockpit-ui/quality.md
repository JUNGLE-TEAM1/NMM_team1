# M5 demo cockpit UI 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: no
- Reason: 이번 변경은 기존 M5 API 계약을 바꾸지 않는 frontend presentation/UI learning surface 개선이다. backend core logic, persistence, runner selection, API schema는 변경하지 않았다.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: `npm run build` -> passed
- Refactor notes: `/etl`의 정보 나열형 UI를 4개 필수 질문 중심 학습 흐름으로 재구성했다. `fallback_succeeded` 해석은 executor별로 분리했고, raw JSON은 필요할 때만 펼치는 세부 evidence로 내렸다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| whitespace | `git diff --check` | pass | no output |
| frontend build | `npm run build` in `frontend/` | pass | Vite build completed |
| final frontend build | `npm run build` in `frontend/` | pass | Vite build completed after combined M5 local/demo documentation cleanup |
| redesign loop 1 | `npm run build`, `git diff --check` | pass | 리디자인 후 build/whitespace 통과 |
| learning flow source check | `rg -n "<M5CoreFlowMap|m5-control-panel|<M5VerdictPanel|<M5NarrativePanel|m5-compact-workflow|<M5EvidenceBoard|m5-detail-drawer" frontend/src/app/App.jsx` | pass | 4칸 흐름 -> 실행 -> 판정 -> 설명 문장 -> workflow -> 핵심 증거 -> raw JSON 순서 확인 |
| guide content check | `rg -n "꼭 알아야 할 4개|5분 실험 순서|상태 해석|실험 기록 템플릿" docs/manual-verification/09-m5-demo-cockpit-learning-guide.md` | pass | guide가 필수 학습 항목과 실험 순서를 짧게 제공 |
| local UI render smoke before redesign | `npm run dev -- --host 127.0.0.1 --port 5173`, open `http://127.0.0.1:5173/etl` | historical pass | old M5 Demo page rendered before this redesign |
| backend local smoke | `./.venv/bin/uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000`; browser click `local_runner 실행` | pass | run `run_reviews_demo_066`; input rows 4; output rows 3; Catalog lineage current run |
| browser smoke after redesign | open `http://127.0.0.1:5173/etl`; click `local_runner 실행`; inspect page text and console logs | pass | run `run_reviews_demo_069`; 4 verdict cards confirmed; output URI and `CatalogMetadata.lineage.run_id` match; browser error logs 0 |
| Catalog evidence smoke | browser after local runner run | pass | `dataset_reviews_gold`, row_count 3, bytes 195, schema fields, local fallback path displayed |
| guide link/content smoke | `rg -n "M5 Demo Cockpit|WorkflowDefinition|ExecutionResult|CatalogMetadata|fallback_succeeded" docs/manual-verification/09-m5-demo-cockpit-learning-guide.md docs/07-manual-verification-playbook.md` | pass | guide and router contain the learning/evidence terms |
| strict harness validation | `scripts/validate-harness.sh --strict` | pass | Harness validation passed |
| integration harness validation | `scripts/validate-harness.sh --integration` | pass | Harness validation passed after option-guide workspace completion |

## CI/CD Gate / CI-CD 게이트

- CI required: no local UI-only change in this turn
- CI result: not run remotely
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: frontend dev server runs on `http://127.0.0.1:5173/`; backend smoke server runs on `http://127.0.0.1:8000/`.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| remote CI | PR/push 단계가 아니며 현재 worktree는 기존 M5 Airflow smoke dirty branch 위에서 진행 중이다. | not requested |
| Airflow executor click smoke | Docker daemon/Airflow runtime은 이번 UI polish의 필수 조건이 아니고, M5 Airflow branch quality에서 별도 local smoke evidence가 있다. | not requested |
| production/browser matrix | local demo cockpit 검증 범위이며 production deploy 범위가 아니다. | not needed |
