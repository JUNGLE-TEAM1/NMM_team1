# File-backed dataset detail 품질 기록

## Context

- Phase: C-16 `feature/file-backed-dataset-detail`
- Date: 2026-06-30
- Branch/work location: `feature/external-connection-persistence` branch에서 진행. dirty worktree가 커서 branch 전환은 수행하지 않았다.

## Commands

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_silver_dataset_persistence.py backend/tests/test_target_dataset_draft_persistence.py -q
npm run build
```

## Results

- Backend focused tests: passed, `29 passed in 0.91s`
- Frontend build: passed, Vite production build 완료
- Browser smoke:
  - `/datasets/source`: `source_product_catalog` 상세에서 `file-backed`, raw path, bytes, `not_measured` 확인
  - `/datasets/silver`: `silver_product_catalog` 상세에서 prepared parquet path, bytes, `rows 1000`, `schema fields 10` 확인
  - `/datasets/gold`: `dataset_product_health` 상세에서 prepared Gold parquet path, bytes, `rows 1000`, `schema fields 30` 확인

## Regression Notes

- Silver 상세 클릭 시 화면이 비던 문제는 잘못된 변수 참조(`draft`/`dataset`)를 evidence panel 위치별로 바로잡아 해결했다.
- Dataset 목록 로딩은 missing file 상태를 성공처럼 만들지 않고 `file_evidence.status`로 분리한다.

## Skipped / Deferred

- 실제 파일 삭제, cascade delete, 대량 row preview, ETL 실행은 C-16 범위가 아니라 수행하지 않았다.
- Gold draft 검증을 위해 local DB에 `silver_product_reviews`와 `dataset_product_health` metadata를 생성했다.
