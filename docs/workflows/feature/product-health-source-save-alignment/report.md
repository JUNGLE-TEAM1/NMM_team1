# Product Health Source Save Alignment 리포트

## Summary

C-44는 Product Health Source Dataset 저장 계약을 runtime source 기준으로 정렬했다. Kafka/PostgreSQL/MongoDB/S3 scope를 primary `raw_scope`로 저장하고, local/prepared artifact는 fallback evidence로 분리한다.

## Changes

- `SourceDatasetRecord`에 `runtime_source`, `fallback_evidence`를 추가했다.
- Product Health source 이름별 fallback evidence resolver를 추가했다.
- Source Dataset 응답에서 runtime source와 demo fallback evidence를 분리해 반환한다.
- Source Dataset 목록/상세 UI에서 runtime scope와 fallback evidence를 구분해 표시한다.
- C-44 저장 계약 테스트를 추가했다.

## Verification

- Passed: `PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_product_health_source_save_alignment.py backend/tests/test_product_health_runtime_connection_seed.py backend/tests/test_product_health_source_inventory.py -q`
- Passed: `npm --prefix frontend run build`
- Passed: `git diff --check`
