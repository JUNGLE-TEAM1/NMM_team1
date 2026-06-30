# Connection sync schedule 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: External Connection에 ingestion/sync schedule metadata를 추가하고 API response, SQLite persistence, frontend create/review/list display, contract sample에 반영했다.
- Verified: `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_persistence.py backend/tests/test_source_dataset_persistence.py` 6 passed, `cd frontend && npm run build` passed, `jq -e . contracts/external_connection.sample.json` passed, diff check passed, browser smoke passed 후 smoke data cleanup 완료.
- Remaining: 실제 scheduler, Source Sync Jobs, Sync Run persistence는 후속.
- Next context: C-8은 `sync_mode`/`sync_schedule` 표시까지만 하며 Source Sync Jobs 메뉴와 scheduler 실행은 후속으로 남긴다.
- Risk: connection schedule과 processing job schedule을 한 화면에서 섞으면 IA가 다시 복잡해질 수 있다.
