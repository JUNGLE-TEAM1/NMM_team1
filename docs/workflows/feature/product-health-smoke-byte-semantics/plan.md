# PH-DATA-2C Smoke byte semantics alignment 계획

## 목적

Product Health smoke evidence에서 준비된 원천 파일 크기와 실제 처리 bytes를 분리해 PH-DATA-3 5GB evidence run에서 숫자 의미가 섞이지 않게 한다.

## 범위

- run summary에 `available_source_total_bytes` 추가
- run summary에 `processed_input_total_bytes`와 status 추가
- source별 `available_source_bytes`, `processed_input_bytes`, `bytes_semantics` 추가
- PH-DATA-3 계획의 5GB 완료 기준을 실제 처리 bytes 기준으로 정렬

## 제외 범위

- 실제 5GB 처리 실행
- source별 정확한 byte-level processed measurement 구현
- M5 Catalog ingest
- M6 SQL grounding

## 완료 기준

- smoke run summary가 source inventory와 processed evidence를 구분한다.
- 기존 `input_total_bytes`는 하위 호환 필드로 남고 의미가 명시된다.
- PH-DATA-3 계획은 `processed_input_total_bytes >= 5GB`를 완료 기준으로 사용한다.
