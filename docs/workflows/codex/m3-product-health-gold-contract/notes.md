# M3 product-health Gold contract notes

## 진행 메모

- 첨부 요청은 `5GB+ input -> gold_product_health -> Catalog -> DuckDB Query -> UI` 세로 경로를 닫기 위한 M3 선행 계약 고정을 요구했다.
- 이번 PR은 M3 범위만 다룬다. M2/M5/M6/M1 구현은 계약 소비자로 남긴다.
- 실제 F bounded smoke에서 output cap이 Gold row를 잘라낼 수 있음을 확인하고, 기본 cap을 제거했다.
- Amazon과 Taobao를 함께 넣은 smoke는 heterogeneous source mechanics 검증용이며 business identity 승인으로 해석하지 않는다.
