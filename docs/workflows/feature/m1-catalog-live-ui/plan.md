# M1 Catalog Live UI 계획

## Phase

- Type: feature
- Branch/work location: `feature/m1-catalog-live-ui`, `docs/workflows/feature/m1-catalog-live-ui`
- Date: 2026-06-26
- Source plan: `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md` Phase 3

## 목표

`/catalog`와 `/catalog/dataset_reviews_gold` 화면에서 M5 `CatalogMetadata`를 live API로 표시한다.

## 포함 범위

- `GET /api/week2/catalog/dataset_reviews_gold` 호출
- dataset id, name, layer, status 표시
- schema fields 표시
- metrics `row_count`, `bytes`, quality facts 표시
- lineage `run_id` 표시
- `s3_uri`, storage prefix, local fallback path 표시
- catalog 없음, run 전 상태, API error 상태 표시
- `/etl` run result에서 catalog detail로 이동하는 CTA 추가

## 제외 범위

- Catalog store/API backend 변경
- SQLite/Postgres Catalog DB 전환
- schema inference 또는 quality rule 계산
- governance/RBAC 설정 구현
- multi-dataset catalog browser 완성
- M6 query 화면 연결

## 완료 기준

- `dataset_reviews_gold` metadata가 live API에서 표시된다.
- schema, metrics, storage, lineage가 placeholder 대신 실제 payload 기반으로 보인다.
- catalog가 없을 때 run 먼저 실행하라는 상태를 표시한다.
- frontend build, live catalog smoke, strict harness validation을 통과한다.

