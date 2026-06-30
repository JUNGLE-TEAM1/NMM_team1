# PH-DATA-5 M6 SQL grounding 계획

## 목적

M6가 `dataset_product_health_gold` CatalogMetadata를 읽어 Gold parquet에 대해 DuckDB SQL을 실행하고 대표 질문 evidence를 반환하게 한다.

## 범위

- CatalogMetadata에서 `storage.local_fallback_path`, `query.table_name`, `query.allowed_columns` 읽기
- 대표 질문 SQL 작성
- top risk products query 실행
- `AIQueryResult` evidence 기준 정리

## 제외 범위

- 외부 LLM 호출
- full document RAG
- vector DB 구축
- Gold transform 재구현

## 입력 문서

- `product-health-synthetic-data-contract.md`
- PH-DATA-4 report
- M6 SQL-first 관련 workspace 문서

## 입력 데이터

- M5 CatalogMetadata
- `gold_product_health` Parquet output

## 산출물

- 대표 질문 SQL
- top risk products query 결과
- `AIQueryResult` evidence 기준
- M1 표시용 answer/evidence shape 확인

## 완료 기준

- M6가 CatalogMetadata 기반으로 Gold path와 allowed columns를 선택한다.
- DuckDB query가 Gold parquet에서 결과를 반환한다.
- 결과에는 `risk_score`, `conversion_rate`, `negative_review_rate`, `late_delivery_rate` 근거가 포함된다.
- `AIQueryResult`가 dataset id와 retrieval trace를 포함한다.

## 수동 검증 방법

1. M6 query endpoint 또는 local runner에서 대표 질문을 실행한다.
2. SQL이 SELECT-only인지 확인한다.
3. returned rows와 evidence의 dataset id가 `dataset_product_health_gold`인지 확인한다.
4. M1에 표시할 수 있는 summary와 metric 근거가 있는지 확인한다.

## 다음 Phase handoff

이 Phase 이후에는 M1 demo CTA/readiness UI와 실제 Product Health 결과 표시를 연결한다.
