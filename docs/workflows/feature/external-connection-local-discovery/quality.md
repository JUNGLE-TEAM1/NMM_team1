# External Connection local discovery 품질 기록

## 검증 일시

- 2026-06-30

## 자동 검증

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_persistence.py backend/tests/test_external_connection_discovery.py -q
npm run build
git diff --check
```

## 결과

- Backend focused tests: 10 passed.
- Frontend build: passed.
- Whitespace check: passed.

## 브라우저 smoke

- 검증 서버:
  - Backend: `PYTHONPATH=backend .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 18000`
  - Frontend: `VITE_API_BASE_URL=http://127.0.0.1:18000 npm run dev -- --host 127.0.0.1 --port 5173`
- `http://127.0.0.1:5173/connections`에서 `연결 생성 -> Local File -> 소스 검사` 확인.
- `backend/samples/product_health_reviews_seed.jsonl` 검사 결과:
  - `Product reviews / VOC`
  - `JSONL`
  - schema field 표시
  - `다음` 활성화
- 없는 경로 `data/does-not-exist/missing.jsonl` 검사 결과:
  - `검사 실패`
  - `Local path` error 표시
  - `다음` 비활성화
- `data/raw/taxi/yellow_tripdata_2019_2025` 검사 결과:
  - `Parquet directory`
  - `Delivery / trip logs`
  - schema field 표시
  - `다음` 활성화

## 남은 위험

- C-14는 schema discovery까지만 구현했다. 실제 ingest, Kafka replay, DB/S3 credential, Airflow/Spark 실행은 후속 Phase 범위다.
- `prepared_dataset`은 제거했다. 원천별 preset의 실제 브라우저 저장 검증은 다음 수동 검증에서 이어간다.
