# Source Snapshot large data readiness 보고서

## Short Report / 짧은 보고

- Type: Phase
- Date: 2026-06-30
- Changed: Source Snapshot 응답에 `snapshot_mode=bounded_sample`, sample/coverage/large-data status 필드를 추가하고 Source Dataset 상세 UI가 bounded coverage와 input/output bytes 의미를 표시하게 했다. C-36 workflow와 acceptance/regression/manual verification 문서를 갱신했다.
- Verified: `PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_source_dataset_persistence.py -q` 12 passed, `npm --prefix frontend run build` passed, `git diff --check` passed.
- Remaining: Product Health source inventory binding, Gold run/catalog/query clean-room E2E, full 5GB ingest runner.
- Next context: C-37 후보는 Product Health 원천별 Source Dataset inventory binding.
- Risk: 기존 persisted snapshot row는 새 필드를 DB에 저장하지 않고 기본값으로 응답한다. 이는 기존 데이터 호환을 위한 의도된 선택이다.
