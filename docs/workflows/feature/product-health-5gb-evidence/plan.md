# PH-DATA-3 5GB evidence run 계획

## 목적

smoke와 같은 transform으로 `processed_input_total_bytes >= 5GB` Product Health 실행 evidence를 만든다.

## 범위

- 5GB 이상 raw/bronze input 범위 선택
- source별 row count, processed bytes, available bytes, duration 측정
- Gold output 생성
- run summary 기록

## 제외 범위

- Gold output이 5GB여야 한다는 주장
- 50GB runtime hardening
- M5 Catalog ingest 구현
- M6 SQL grounding 구현

## 입력 문서

- `product-health-synthetic-data-contract.md`
- PH-DATA-2 report
- `docs/07-manual-verification-playbook.md`의 Week 2 상품 리스크 대표 경로 점검

## 입력 데이터

- PH-DATA-2에서 확정된 source path
- Kaggle/Amazon/MEP/Taxi raw input 중 합계 5GB 이상 범위

## 산출물

- 5GB run summary
- source별 row count / processed bytes / available bytes / duration
- output row count / bytes / path
- 5GB blocker 또는 skip 사유

## 완료 기준

- `processed_input_total_bytes >= 5GB`가 run summary에 기록된다.
- `input_total_bytes`는 PH-DATA-3부터 `processed_input_total_bytes`와 같은 의미로 유지한다.
- source별 evidence가 남는다.
- Gold output이 생성되고 SQL로 읽힌다.
- 5GB를 input 처리 evidence로 설명하며 Gold output 크기로 오해하지 않는다.

## 수동 검증 방법

1. run summary의 `processed_input_total_bytes`와 `input_total_bytes_semantics`를 확인한다.
2. source별 processed bytes, available bytes, duration을 확인한다.
3. Gold output path와 row count를 확인한다.
4. DuckDB로 top risk query를 실행한다.

## 다음 Phase handoff

PH-DATA-4는 이 run summary와 Gold output을 M5 Catalog 등록 기준으로 사용한다.
