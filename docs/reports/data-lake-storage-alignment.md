# Data Lake Storage Alignment 보고서

## Short Report / 짧은 보고

- Type: Phase C-28A
- Date: 2026-06-30
- Changed: Source Snapshot, Silver materialization, Gold local runner output을 `data/lake` 레이어 경로로 정렬했다.
- Verified: focused backend test 28 passed, frontend build 성공, local API smoke 성공.
- Remaining: C-29에서 Jobs/Runs UI가 긴 lake path를 안정적으로 표시하는지 확인.
- Next context: C-29에서 Jobs/Runs record가 `data/lake` output path를 공통 실행 증거로 보여주면 된다.
- Risk: prepared Product Health parquet는 기존 `data/local_sources/product_health` fallback으로 남아 있어 prepared reference mode는 old path를 계속 표시할 수 있다.

## 구현 요약

- `backend/app/services/data_lake_paths.py`를 추가해 Bronze/Silver/Gold runtime path helper를 만들었다.
- Source Snapshot 기본 출력 경로를 `data/lake/bronze/source_snapshots/`로 변경했다.
- Silver materialization 기본 출력 경로를 `data/lake/silver/`로 변경했다.
- Gold local runner의 Silver parquet 기반 출력 경로를 `data/lake/gold/run_id=<run_id>/`로 변경했다.
- Silver/Gold file evidence는 lake output을 먼저 확인하고 prepared sample path를 fallback으로 유지한다.

## 검증

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_silver_dataset_persistence.py backend/tests/test_target_dataset_local_materialization.py -q
npm --prefix frontend run build
```

- focused backend test: 28 passed
- frontend build: 성공
- local API smoke:
  - Source Snapshot: `data/lake/bronze/source_snapshots/...jsonl`
  - Silver output: `data/lake/silver/...parquet`
  - Gold output: `data/lake/gold/run_id=4d84c97c-dcfb-44c5-8ab1-d9c4d3335fb6/...parquet`
  - `object_storage.status`: `not_uploaded`

## 남은 일

- C-29에서 Jobs/Runs runtime record UI가 lake path를 과도하게 길게 깨뜨리지 않고 표시하는지 확인한다.
