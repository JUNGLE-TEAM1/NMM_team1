# Source dataset ingest snapshot 보고서

## Short Report / 짧은 보고

- Type: Feature Phase
- Date: 2026-06-30
- Changed: Source Dataset raw snapshot API/interface contract, SQLite evidence table, local/runtime bounded snapshot service, Source Dataset 상세 UI 실행 버튼/결과 카드 추가
- Verified: backend focused tests `21 passed`, frontend build 성공, browser smoke에서 `Raw snapshot 생성` 후 `succeeded`, `row_count=100`, output path 표시 확인
- Remaining: runtime connector full ingest UI는 secret_ref 재입력 surface와 함께 후속 Phase에서 확장
- Next context: C-27 `feature/silver-dataset-runtime-materialization`
- Risk: local sample snapshot은 완료됐지만 운영형 full ingest/retry/backfill은 제외

## 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_external_connection_discovery.py -q
npm --prefix frontend run build
curl -s -o /tmp/source_snapshots_status.txt -w '%{http_code}\n' http://127.0.0.1:18000/api/source-datasets/a0882fab-3f09-45f2-bfff-a4c629692d77/snapshots
```

## 증거

- Workspace report: `docs/workflows/feature/source-dataset-ingest-snapshot/report.md`
- Quality: `docs/workflows/feature/source-dataset-ingest-snapshot/quality.md`
- Browser smoke output path: `data/source_snapshots/source_c26_runtime_discovery_smoke/20260630T133508Z-9def9ede.jsonl`
