# Airflow trigger readiness 보고서

## Short Report / 짧은 보고

- Type: Phase C-19
- Date: 2026-06-30
- Changed: `GET /api/week2/airflow/readiness`와 `/runs`의 Airflow Trigger Readiness panel을 추가했다.
- Verified: backend focused tests `8 passed`, frontend build 통과, readiness HTTP smoke 통과.
- Remaining: 실제 Airflow DAG trigger/success smoke는 Airflow URL, DAG id, credential, result artifact path가 확인된 뒤 별도 진행한다.
- Next context: 이 Phase는 readiness/fallback 표시 전용이며 DAG trigger를 실행하지 않는다.
- Risk: Playwright Chromium/Chrome 부재로 browser automation은 실행하지 못했고 HTTP/dev-bundle smoke로 대체했다.

## 변경 요약

- `Week2AirflowAdapter`에 env 기반 readiness summary를 추가했다.
- Week2 workflow router에 `/api/week2/airflow/readiness`를 추가했다.
- `/runs` 화면에 read-only Airflow readiness panel을 추가했다.
- readiness response와 UI는 credential 값 대신 configured boolean만 표시한다.

## 검증

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_airflow_readiness.py backend/tests/test_week2_airflow_adapter.py -q
npm run build
curl -s http://127.0.0.1:18000/api/week2/airflow/readiness
```

결과:

- Backend focused tests: `8 passed`.
- Frontend build: 통과.
- HTTP smoke: `status=not_configured`, `trigger_available=false`, `fallback_available=true`, `credential_values_exposed=false` 확인.

## 문서 업데이트

- `docs/03-interface-reference.md`: Airflow readiness route와 response boundary 추가.
- `docs/05-acceptance-scenarios-and-checklist.md`: read-only readiness/credential 미노출 수용 기준 추가.
- `docs/06-regression-and-failure-scenarios.md`: readiness가 DAG trigger 성공처럼 보이는 회귀 시나리오 추가.
- `docs/07-manual-verification-playbook.md`: C-19 수동 검증 절차 추가.

## 남은 위험

- 기본 Vite proxy는 `127.0.0.1:8000`이다. 이번 검증에서는 기존 8000 서버를 건드리지 않고 `VITE_API_BASE_URL=http://127.0.0.1:18000`으로 새 backend를 지정했다.
- 실제 DAG trigger는 C-19 범위 밖이다.
