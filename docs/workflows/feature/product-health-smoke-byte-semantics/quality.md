# PH-DATA-2C 품질 기록

## Context Budget mode

- Mode: Lite Read
- 주요 문서: `product-health-synthetic-data-contract.md`, PH-DATA-3 plan, `docs/03-interface-reference.md`

## 검증 결과

| 항목 | 기준 | 결과 |
| --- | --- | --- |
| smoke summary | `available_source_total_bytes`, `processed_input_total_bytes`, `input_total_bytes_semantics` 포함 | passed |
| source evidence | source별 `available_source_bytes`, `processed_input_bytes`, `bytes_semantics` 포함 | passed |
| compatibility | 기존 `input_total_bytes` 유지 | passed |
| PH-DATA-3 plan | 실제 처리 bytes 기준으로 갱신 | passed |

## 실행 증거

| 명령 | 결과 |
| --- | --- |
| `.venv/bin/python scripts/product_health_synthetic_smoke.py` | passed |
| Python JSON assertion | passed |

확인 값:

| 항목 | 값 |
| --- | --- |
| `evidence_mode` | `source_inventory_and_row_limited_smoke_transform` |
| `available_source_total_bytes` | `11080285895` |
| `processed_input_total_bytes` | `null` |
| `input_total_bytes_semantics` | `available_source_bytes_for_backward_compatibility_not_5gb_processed_evidence` |
