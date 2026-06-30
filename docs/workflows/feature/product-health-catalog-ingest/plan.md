# PH-DATA-4 M5 Catalog ingest 계획

## 목적

`dataset_product_health_gold` handoff JSON과 Gold output을 M5 CatalogMetadata 또는 현재 M5 계약에 맞춰 등록한다.

## 범위

- `catalog/dataset_product_health_gold.json` 검토
- PR #269 path convention과 정렬
- M5 CatalogMetadata 등록 또는 fixture 갱신
- lineage/source evidence 확인

## 제외 범위

- Gold metric 계산식 변경
- 5GB transform 재실행
- M6 answer generation 구현

## 입력 문서

- `product-health-synthetic-data-contract.md`
- PH-DATA-3 report
- PR #269 Product Health Catalog 계약
- `docs/03-interface-reference.md`

## 입력 데이터

- PH-DATA-3 Gold output
- PH-DATA-3 run summary
- `catalog/dataset_product_health_gold.json`

## 산출물

- Catalog 등록 evidence
- `GET /api/week2/catalog/dataset_product_health_gold` 확인 기준
- lineage/source evidence 확인 기준
- path convention 보정 기록

## 완료 기준

- M5 Catalog에서 `dataset_product_health_gold`를 조회할 수 있다.
- `query.table_name=gold_product_health`가 유지된다.
- `storage.local_fallback_path`가 실제 Gold output을 가리킨다.
- allowed columns에 대표 질문 필드가 포함된다.

## 수동 검증 방법

1. Catalog API 또는 fixture에서 `dataset_product_health_gold`를 확인한다.
2. storage path가 실제 파일과 연결되는지 확인한다.
3. lineage source 목록이 4개 source를 포함하는지 확인한다.
4. M1/M6가 읽을 핵심 필드가 빠지지 않았는지 확인한다.

## 다음 Phase handoff

PH-DATA-5는 M5 CatalogMetadata를 읽어 DuckDB SQL grounding을 붙인다.
