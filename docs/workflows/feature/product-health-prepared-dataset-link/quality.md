# Product Health 원천별 Source Dataset 연결 품질 기록

## 검증 일시

- 2026-06-30

## 자동 검증

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_external_connection_discovery.py -q
npm run build
git diff --check
```

## 결과

- Backend focused tests: 13 passed.
- Frontend build: passed.
- Whitespace check: passed.

## 브라우저 smoke

- 검증 서버:
  - Backend: `PYTHONPATH=backend .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 18000`
  - Frontend: `VITE_API_BASE_URL=http://127.0.0.1:18000 npm run dev -- --host 127.0.0.1 --port 5173`
- 실행 흐름:
  1. `/connections`에서 `MEP Product JSON` preset 선택.
  2. `data/local_sources/product_health/raw/mep_3m/annotations-1k.json` schema discovery 성공.
  3. `conn_mep_product_catalog_json` External Connection 저장.
  4. `/datasets/source`에서 해당 connection 선택.
  5. Source Dataset 이름이 `source_product_catalog`로 추천됨.
  6. Source Dataset 저장 성공.
- DB 확인:
  - `source_product_catalog | conn_mep_product_catalog_json | local_file | data/local_sources/product_health/raw/mep_3m/annotations-1k.json | 10 fields`

## 남은 위험

- 이번 Phase는 Source Dataset metadata 연결까지만 검증했다.
- Amazon/Behavior/Taxi도 같은 mapping을 적용하지만 브라우저 저장 smoke는 MEP 1개 원천으로 대표 검증했다.
- Silver/Gold 연결은 다음 Phase에서 이어간다.
