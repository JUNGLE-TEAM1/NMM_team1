# Product Health Manual Run execution 노트

## 진행 메모

- PR 5A는 Product Health Manual Run result contract를 pending으로 고정했다.
- PR 5B는 Product Health run만 별도 실행 경로로 분기한다. 일반 Target Dataset run은 기존 Week2 reviews fixture handoff를 유지한다.
- PR 4 snapshot 저장소가 아직 없으므로, PR 5B는 `TargetDatasetRunCreate.source_snapshots[]` 요청 필드로 동일 metadata shape를 받아 실행한다.
- snapshot이 없으면 성공처럼 보이지 않도록 `status=failed`, `error.code=MISSING_SOURCE_SNAPSHOT`을 저장한다.

## 결정

- Product Health output은 M3 Gold Contract v2 schema 순서대로 `gold_product_health.parquet`에 쓴다.
- Product Health `target_dataset_handoff.runtime_output_scope`는 성공 시 `product_health_gold_output`, 실패 시 `product_health_gold_output_failed`를 사용한다.
- `source_snapshots[]`는 `file://...parquet` 또는 repo 기준 상대/절대 path를 받을 수 있으나, format은 이번 PR에서 `parquet`만 허용한다.

## 열린 질문

- PR 4가 latest successful snapshot lookup 저장소를 붙이면 API 요청의 `source_snapshots[]`를 생략해도 서버가 조회할지 여부는 후속 통합에서 결정한다.
- Airflow/Spark cluster에서 Product Health를 실행할지, 지금처럼 API-local artifact execution을 demo smoke로 유지할지는 후속 M2/M5 통합에서 결정한다.

## 링크 / 증거

- Issue: #313
- Branch: `feature/product-health-manual-run-execution`
- Focused test: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_target_dataset_run_handoff.py -q` -> `5 passed`
- Related tests: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_target_dataset_run_handoff.py backend/tests/test_target_dataset_job_draft.py backend/tests/test_product_health_processing_template.py tests/test_product_health_contracts.py backend/tests/test_week2_product_health_l6_evidence.py backend/tests/test_week2_spark_runner.py -q` -> `30 passed`
