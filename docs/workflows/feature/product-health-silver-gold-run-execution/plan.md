# Product Health Silver Gold Run Execution 계획

## 목표

Gold Dataset 저장 후 Run을 만들고 실행하면 Product Health Gold 결과가 실행 증거로 남도록 한다. 이미 준비된 `gold_product_health.parquet`가 있으면 prepared reference로 연결하고, 가능한 경우 기존 local runner 범위에서 Silver/Gold materialization evidence를 남긴다.

## 범위

- Product Health Gold draft에서 `Run 준비`를 만든다.
- 실행 시 prepared `gold_product_health.parquet`를 `prepared_gold_reference`로 연결한다.
- run record에 output path, row count, bytes, materialization mode, source/silver evidence를 남긴다.
- prepared reference와 새 local materialization output을 UI에서 구분한다.

## 제외 범위

- full 5GB ETL 재실행.
- Spark/Airflow 운영 실행.
- Catalog publish와 AI Query handoff.
- Source inventory 생성.

## Acceptance Criteria

- Product Health Gold Run이 queued -> succeeded로 전환된다.
- 실행 결과가 `gold_product_health.parquet` path와 row/bytes evidence를 표시한다.
- prepared reference 실행은 “새로 대용량 ETL을 돌린 것”처럼 보이지 않는다.
- Run evidence가 C-39 Catalog publish 입력으로 충분하다.

## Regression / Failure Scenario

- prepared Gold reference를 local demo JSONL output과 섞으면 실패다.
- run status만 succeeded이고 output path/row/bytes가 없으면 실패다.
- Product Health Gold가 아닌 일반 Gold execution 경로를 깨면 실패다.

## Manual Verification

1. `/datasets/gold`에서 Product Health Gold draft를 선택한다.
2. `Run 준비`를 눌러 run record를 만든다.
3. `/runs`에서 해당 run을 실행한다.
4. output path, row count, bytes, materialization mode를 확인한다.
