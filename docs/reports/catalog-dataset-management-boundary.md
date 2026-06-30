# CatalogDataset management boundary 보고서

## Short Report / 짧은 보고

- Type: Phase C-21
- Date: 2026-06-30
- Changed: `GET /api/catalog/datasets/management-policy`와 `/datasets/gold`의 CatalogDataset Management Boundary panel을 추가했다.
- Verified: backend focused tests `5 passed`, frontend build 통과.
- Remaining: metadata-only delete 구현, output file delete, cascade delete, approval workflow는 후속 Phase다.
- Next context: C-22 credential/secret connection design.
- Risk: 현재 registered CatalogDataset은 상세/AI Query context만 허용하는 read-only evidence다.

## 변경 요약

- CatalogDataset management policy API를 추가했다.
- Gold Datasets 화면에 registered CatalogDataset의 read-only boundary를 표시했다.
- 정책은 `detail`, `ai_query_context`만 허용하고 `metadata_update`, `metadata_delete`, `file_delete`, `cascade_delete`를 disabled/deferred로 둔다.

## 검증

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py -q
npm run build
```

결과:

- Backend focused tests: `5 passed`.
- Frontend build: 통과.

## 문서 업데이트

- `docs/03-interface-reference.md`: management policy route와 delete/update/file delete 경계 추가.
- `docs/05-acceptance-scenarios-and-checklist.md`: registered CatalogDataset read-only management 수용 기준 추가.
- `docs/06-regression-and-failure-scenarios.md`: evidence file 삭제와 management가 섞이는 회귀 시나리오 추가.
- `docs/07-manual-verification-playbook.md`: C-21 수동 검증 절차 추가.

## 남은 위험

- metadata-only delete를 실제 구현하려면 AI Query readiness, Target Dataset Job Run lineage, output file evidence 참조를 먼저 409 정책으로 잠가야 한다.
- output file 삭제는 사람 확인과 rollback/복구 계획 없이는 구현하지 않는다.
