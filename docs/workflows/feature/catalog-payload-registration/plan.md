# Catalog payload 기반 Catalog 등록 계획

## 브랜치

- Branch: `feat-#268`
- Workspace: `docs/workflows/feature/catalog-payload-registration`
- Created: 2026-06-30

## 목표

- PR 5A Manual Run 결과의 `catalog_payload`를 PR 6 Catalog 등록 입력으로 소비한다.
- `catalog_payload.storage_uri`가 있으면 M5가 gold parquet 위치를 `run_id`, `output_path`, hardcoded path로 다시 추측하지 않게 한다.
- 기존 local runner, spark runner, legacy Airflow result 경로는 유지한다.

## 범위

- `Week2RunnerResult`에 optional `catalog_payload`를 추가한다.
- `Week2AirflowAdapter`가 `week2_result.catalog_payload`를 보존한다.
- `Week2WorkflowService`가 성공 run에서 `catalog_payload`를 우선해 `CatalogMetadata`를 등록한다.
- `catalog_payload.storage_uri` 누락 시 Catalog 등록을 건너뛰고 run log에 이유를 남긴다.
- Source of Truth와 fixture contract를 최소 범위로 갱신한다.

## 범위 제외

- PR 5A producer 구현.
- M6 SQL engine의 S3 직접 읽기.
- external object storage credential, MinIO upload behavior 변경.
- M1 UI 표시 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`

## 완료 기준

- [x] `catalog_payload.storage_uri`가 Catalog에 그대로 보존된다.
- [x] `catalog_payload`가 있으면 기존 path 추측 로직보다 우선된다.
- [x] `storage_uri` 누락 시 Catalog 등록을 건너뛰는 회귀 테스트가 있다.
- [x] 기존 M5 workflow/catalog focused tests가 통과한다.
- [x] 관련 contract, acceptance, regression, manual verification 문서가 갱신된다.
