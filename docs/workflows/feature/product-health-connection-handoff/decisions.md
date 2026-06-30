# PH-DATA-2B 결정

| 날짜 | 결정 | 근거 |
| --- | --- | --- |
| 2026-06-30 | 데모 기본 흐름은 local path 직접 연결이 아니라 External Connection 등록 후 Source Dataset 선택으로 표현한다. | 사용자가 사이트에서 연결을 시작하는 흐름이 더 자연스럽고, M1 UI와 M5 persistence 연결에도 맞다. |
| 2026-06-30 | Taxi는 `conn_taxi_postgres`를 canonical connection id로 두고 local parquet는 fallback으로 둔다. | PR #297의 Taxi PostgreSQL 등록 방향과 맞추면서 현재 로컬 evidence를 유지하기 위해서다. |
| 2026-06-30 | source handoff JSON은 Catalog handoff와 별도로 둔다. | Source Dataset 등록 계약과 Target Dataset catalog 계약을 분리하면 M1/M5가 각각 소비하기 쉽다. |
