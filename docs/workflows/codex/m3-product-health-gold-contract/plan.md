# M3 product-health Gold contract plan

## 목적

`gold_product_health`를 발표용 가짜 fixture가 아니라 M3 계약 산출물로 고정한다. 이번 범위는 M3의 schema, transform semantics, risk score policy, zero denominator rule, source-level evidence, M2 handoff spec, M5/M6 catalog/query handoff fixture까지다.

## 포함 범위

- `gold_product_health` 고정 출력 schema와 metric semantics.
- JSON/JSONL/CSV local reference transform.
- source-level aggregate 후 product_id universe를 만드는 join strategy.
- risk score component coverage와 missing-component handling.
- Gold output 축소가 집계인지 유실인지 판단하는 evidence.
- Spark/MinIO 검증 harness 계약과 보고서 evidence.

## 제외 범위

- M2 production Spark runtime 소유 구현.
- M5 catalog persistence 실제 DB 쓰기.
- M6 SQL planner production routing.
- M1 product risk UI 화면 구현.
- Kafka를 product-health 필수 입력으로 연결하는 작업.
