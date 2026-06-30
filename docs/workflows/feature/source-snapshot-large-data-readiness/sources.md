# Source Snapshot large data readiness sources

| Source | Why |
| --- | --- |
| `docs/reports/source-dataset-ingest-snapshot.md` | C-26C snapshot의 기존 완료 범위와 남은 full ingest gap 확인 |
| `docs/reports/source-silver-gold-chain-smoke.md` | C-35 이후 clean-room chain의 현재 한계 확인 |
| `backend/app/services/source_dataset_snapshot.py` | Snapshot 생성 semantics 구현 위치 |
| `frontend/src/app/App.jsx` | Source Dataset 상세 snapshot evidence UI 위치 |
| `docs/03-interface-reference.md` | Snapshot API contract Source of Truth |
| `docs/workflows/feature/source-snapshot-large-data-readiness/decisions.md` | bounded sample hardening과 full ingest 보류 결정 handoff |
