# Gold dataset runtime materialization quality

## 검증 요약

- 상태: 통과
- Context Budget mode: Lite Read
- 범위: C-28 `feature/gold-dataset-runtime-materialization`

## 실행한 검증

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_job_run_handoff.py backend/tests/test_week2_storage_adapter.py -q
npm --prefix frontend run build
```

## 결과

- Backend focused tests: `8 passed`
- Frontend build: 성공
- Browser smoke:
  - `dataset_c28_browser_gold` draft/run 생성
  - `/runs`에서 `실행` 버튼 클릭
  - toast: `dataset_c28_browser_gold Silver parquet to Gold 완료됐습니다.`
  - run card: `OUTPUT dataset_c28_browser_gold.parquet`, `ROWS 1000`, `BYTES 9.0 KiB`, `STORAGE not_uploaded`

## 회귀 보호

- prepared Gold가 있는 `dataset_product_health`는 여전히 `prepared_gold_reference`로 동작한다.
- prepared Gold가 없는 draft는 materialized Silver parquet를 읽어 Gold parquet를 생성한다.
- object storage는 upload 성공으로 오인하지 않고 `not_uploaded`와 expected `object_uri`로 분리한다.

## 남은 위험

- 실제 MinIO upload는 이번 Phase에서 실행하지 않았다. storage adapter smoke는 통과했지만 Gold runner에서는 opt-in 미설정 상태로 evidence만 남긴다.
- Gold transform은 demo-safe synthesis이며 production-grade join/aggregate/risk scoring engine은 후속 범위다.
