# C-28A 품질 기록

## 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_silver_dataset_persistence.py backend/tests/test_target_dataset_local_materialization.py -q
npm --prefix frontend run build
```

## 결과

- `PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_silver_dataset_persistence.py backend/tests/test_target_dataset_local_materialization.py -q`: 28 passed
- `npm --prefix frontend run build`: 성공
- local API smoke: Source Snapshot 2개, Silver parquet 2개, Gold parquet 1개가 `data/lake` 아래 생성됨

## 메모

- 이 Phase는 저장 경로 계약 보정이므로 DB migration은 없다.
- 기존 prepared parquet는 fallback으로 남긴다.
