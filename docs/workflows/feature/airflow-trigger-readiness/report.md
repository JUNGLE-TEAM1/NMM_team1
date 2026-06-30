# Airflow trigger readiness 보고서

## Short Report / 짧은 보고

- Type: Phase C-19
- Date: 2026-06-30
- Changed: Week2 Airflow env readiness API와 `/runs` read-only readiness panel을 추가했다.
- Verified: `backend/tests/test_week2_airflow_readiness.py`, `backend/tests/test_week2_airflow_adapter.py`, frontend build, HTTP smoke.
- Remaining: 실제 Airflow DAG trigger/success 검증은 Airflow URL, DAG id, credential, result artifact path가 제공될 때 별도 smoke로 진행한다.
- Next context: C-19는 trigger 실행이 아니라 readiness/fallback 경계 표시 전용이다.
- Risk: 브라우저 자동 검수는 로컬 Playwright/Chrome 부재로 HTTP smoke까지만 수행했다.

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/external-connection-persistence`, `docs/workflows/feature/airflow-trigger-readiness/`
- Date: 2026-06-30
- Workspace state: dirty worktree 위에서 C-19 관련 파일만 변경.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`

## Goal / 목표

- Airflow env가 없는 demo 환경과 실제 DAG trigger 가능 환경을 UI/API에서 구분한다.
- readiness 조회가 DAG trigger나 credential 노출로 보이지 않게 한다.

## Changed Files / 변경 파일

- `backend/app/services/week2_airflow_adapter.py`
- `backend/app/api/week2_workflow.py`
- `backend/tests/test_week2_airflow_readiness.py`
- `frontend/src/api/week2Api.js`
- `frontend/src/api/asklakeClient.js`
- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_airflow_readiness.py backend/tests/test_week2_airflow_adapter.py -q
npm run build
curl -s http://127.0.0.1:18000/api/week2/airflow/readiness
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/airflow-trigger-readiness/quality.md`
- Quality gate status: focused tests/build/HTTP smoke 통과.
- TDD status: readiness shape와 route read-only 성격을 backend test로 고정.
- Skipped checks: browser automation은 Playwright Chromium/Chrome 부재로 미실행.

## Regression Guard / 회귀 보호

- Checked feature: Airflow readiness가 DAG trigger 성공처럼 보이는 경우.
- Protected behavior: readiness는 read-only이고 credential 값과 trigger button을 제공하지 않는다.
- Result: API response에 `credential_values_exposed=false`, UI 문구에 DAG trigger 미실행 안내를 둔다.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` C-19 항목.
- Environment: backend `127.0.0.1:18000`, frontend `127.0.0.1:5173` with `VITE_API_BASE_URL=http://127.0.0.1:18000`.
- Result: HTTP smoke로 env missing fallback response 확인.
- Failure/limitation: browser automation 미실행.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Airflow readiness read-only 표시와 credential value 미노출.
- Status: 구현/검증 완료.
- Evidence: backend focused tests, HTTP smoke, frontend build.

## Secret / Migration / Env Check

- Secret check: credential 값은 API/UI에 노출하지 않는다.
- Migration/data change: 없음.
- Env change: 새 필수 env 이름만 문서화. 실제 값은 추가하지 않음.

## Final Judgment / 최종 판단

- Done: C-19 Airflow readiness/fallback 표시 완료.
- Remaining risk: 실제 Airflow DAG trigger 성공 검증은 별도 환경 준비 후 수행해야 한다.
