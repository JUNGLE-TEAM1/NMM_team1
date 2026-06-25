# AskLake week 2 contract setup 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Decision Option Brief는 사용하지 않았다. 이번 Phase는 이미 project context에서 확정된 2주차 결정의 계약 fixture 적용이며, 새 고영향 대안 비교는 발생하지 않았다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Week 2 contract package 위치 | `contracts/*.sample.json` | M1~M6가 구현 전에 같은 fixture shape를 소비하게 하기 위해 | 사용자 `진행해` 요청 / 2026-06-25 |
| SQL engine 경계 | `SqlEngineAdapter` 먼저, DuckDB는 MVP 구현체 | M6가 DuckDB/Trino/Athena에 직접 의존하지 않게 하기 위해 | project context 결정 반영 / 2026-06-25 |
| 불확실한 값 처리 | TODO/decision으로 보류 | sample path, row count, MinIO layout을 임의 확정하지 않기 위해 | project context 결정 반영 / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Amazon Reviews sample 실제 path/row count | 실제 데이터 위치와 처리 범위 확인 필요 | M3 sample reader 구현 전 | M3 JSON/Schema 구현 Phase |
| final MinIO bucket/path naming | storage contract 확인 필요 | M5 Workflow/Catalog 구현 전 | M5 Workflow/Catalog 구현 Phase |
| local runner fallback threshold | Airflow 실행 환경 확인 필요 | M5 Airflow adapter 구현 전 | M5 Workflow/Catalog 구현 Phase |
| `SqlEngineAdapter` Python 위치 | backend 패키지 구조와 M6 구현 위치 확인 필요 | M6 구현 시작 전 | M6 RAG/AI Query 구현 Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Week 2 fixture package | M1~M6 중 하나가 fixture와 다른 shape를 요구함 | `docs/03`과 `contracts/*.sample.json`을 먼저 갱신하고 downstream docs를 재검토한다. |
| DuckDB adapter | 검증 SQL을 처리하지 못함 | adapter boundary는 유지하고 Trino/Athena 후보를 별도 Decision Option Brief로 검토한다. |
