# Airflow trigger readiness 품질 기록

## 검증 일자

- 2026-06-30

## 실행한 검증

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_airflow_readiness.py backend/tests/test_week2_airflow_adapter.py -q
npm run build
curl -s http://127.0.0.1:18000/api/week2/airflow/readiness
curl -s http://127.0.0.1:5173/src/api/httpClient.js | sed -n '1,40p'
```

## 결과

- Backend focused tests: `8 passed`.
- Frontend build: 통과.
- HTTP smoke: `status=not_configured`, `trigger_available=false`, `fallback_available=true`, `credential_values_exposed=false` 응답 확인.
- Frontend dev bundle: `VITE_API_BASE_URL=http://127.0.0.1:18000` 주입 확인.

## 제한

- 로컬 Playwright Chromium과 Google Chrome channel이 설치되어 있지 않아 browser automation은 실행하지 못했다.
- 기본 Vite proxy는 `127.0.0.1:8000`을 바라본다. 이번 검수에서는 기존 8000 서버를 건드리지 않고 `VITE_API_BASE_URL=http://127.0.0.1:18000`으로 새 backend를 지정했다.
