# Silver dataset runtime materialization 보고서

## Short Report / 짧은 보고

- Type: Feature Phase
- Date: 2026-06-30
- Changed: Silver materialization API/interface contract, SQLite evidence table, local parquet materialization service, Silver 상세 UI 실행 버튼/결과 카드 추가
- Verified: backend focused tests `25 passed`, frontend build 성공, browser smoke에서 `Silver output 생성` 후 `succeeded`, `row_count=100`, parquet output path 표시 확인
- Remaining: Spark distributed execution, connector direct read, quarantine/rule engine 고도화는 후속
- Next context: C-28 `feature/gold-dataset-runtime-materialization`
- Risk: demo-safe projection/trim 중심 transform이며 production ETL은 아님

## 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_silver_dataset_persistence.py backend/tests/test_source_dataset_persistence.py -q
npm --prefix frontend run build
curl -s -o /tmp/silver_mat_status.txt -w '%{http_code}\n' http://127.0.0.1:18000/api/silver-datasets/not-found/materializations
```

## 증거

- Workspace report: `docs/workflows/feature/silver-dataset-runtime-materialization/report.md`
- Quality: `docs/workflows/feature/silver-dataset-runtime-materialization/quality.md`
- Browser smoke output: `data/local_sources/product_health/silver/silver_c26_runtime_discovery_smoke.parquet`
- Browser smoke input: `data/source_snapshots/source_c26_runtime_discovery_smoke/20260630T133508Z-9def9ede.jsonl`
