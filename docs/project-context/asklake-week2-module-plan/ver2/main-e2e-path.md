# AskLake Week2 ver2 Main E2E Path

## 목적

이 문서는 Week2 발표와 병렬 구현의 기준이 되는 분석 대표 E2E path를 하나로 고정한다.

Phase 2의 구현 전환 계획은 기존 구현을 유지한 채 adapter-first로 전환하는 방향을 정했다. Phase 3은 그 위에서 M6 AI Query/분석 대표 경로를 Amazon Reviews JSON 중심으로 확정한다.

Week2 전체 데이터 경로는 Amazon Reviews JSON, Taxi Batch, Kafka Event 세 가지다. 이 문서는 그중 M6 분석까지 우선 연결할 대표 경로를 정의한다.

## 확정 경로

```text
Amazon Reviews JSON
-> M3 profile/schema/transform spec
-> M5 WorkflowDefinition / existing local runner
-> M5 Catalog
-> M6 AI Query
-> M1 UI
```

이 경로는 발표에서 반드시 동작해야 하는 분석 대표 end-to-end 흐름이다.

## 모듈별 책임

| 모듈 | 분석 대표 path 책임 | 완료 기준 |
| --- | --- | --- |
| M1 | run/catalog/query/evidence 상태를 클릭 흐름으로 보여준다. | M5/M6 API 결과를 화면에서 확인할 수 있다. |
| M3 | Amazon Reviews JSON을 inspect/profile하고 schema/transform spec을 만든다. | JSON sample에서 profile facts와 최소 `TransformSpec` shape가 나온다. |
| M5 | `WorkflowDefinition`을 받아 local runner로 실행하고 Catalog metadata를 저장/노출한다. | run 결과와 Catalog entry가 같은 `run_id`/dataset context로 이어진다. |
| M6 | M5 Catalog를 기반으로 AI Query skeleton을 응답 경로에 연결한다. | fixture-only 설명이 아니라 Catalog metadata를 근거로 답한다. |

## 세 데이터 경로의 위치

M2 Taxi Batch와 M4 Kafka Event는 optional이 아니다. 둘 다 Week2 필수 처리/evidence 경로다. 다만 이번 문서의 M6 분석 대표 경로를 막는 선행 조건은 아니다.

| 영역 | Week2 역할 | M6 분석 대표 경로와의 관계 |
| --- | --- | --- |
| Amazon Reviews JSON | M3 profile/schema/TransformSpec, M5 Catalog, M6 AI Query까지 우선 연결 | 분석 대표 경로 |
| Taxi Batch 또는 정형 batch | M2 runtime/batch 처리, row_count, bytes, duration, output_path evidence | 필수 처리/evidence 경로. M6 분석 연결은 이번 기본 범위가 아니다. |
| Kafka Event / streaming ingestion | M4 replay/ingestion, throughput, lag, restart evidence | 필수 처리/evidence 경로. M6 분석 연결은 이번 기본 범위가 아니다. |

## 데이터셋 기준

분석 대표 path의 첫 데이터셋은 Amazon Reviews JSON 또는 그와 같은 JSON/JSONL sample이다.

- JSON object 또는 JSONL record를 읽을 수 있어야 한다.
- schema/profile 단계는 nested field, optional field, array/object field를 최소한 facts로 남긴다.
- transformation은 처음부터 full ETL이 아니라 발표에 필요한 select/flatten/normalize 수준으로 제한한다.
- output은 M5 Catalog와 M6 query가 읽을 수 있는 metadata facts를 남긴다.

Taxi Batch와 Kafka Event는 별도 필수 처리/evidence 경로로 유지한다.

- Taxi Batch는 정형 데이터를 batch로 처리하고 row_count, bytes, duration, output_path를 남긴다.
- Kafka Event는 replay/ingestion과 throughput, lag, restart/replay evidence를 남긴다.
- 두 경로 모두 M5 run evidence 또는 Catalog에서 처리 결과를 확인할 수 있어야 한다.

## 발표 성공 조건

1. 사용자가 M1에서 demo source 또는 run을 선택한다.
2. M5가 Amazon Reviews JSON 기반 workflow를 실행하거나 실행 결과를 조회한다.
3. M5 Catalog에서 dataset/run/output metadata를 확인할 수 있다.
4. M6가 Catalog metadata를 근거로 질문에 답한다.
5. M1이 run, catalog, query, evidence 상태를 한 흐름으로 보여준다.

## 제외 범위

- Taxi/Kafka를 optional로 취급하지 않는다. 둘 다 필수 처리/evidence 경로다.
- Taxi/Kafka의 M6 분석 연결을 이번 기본 범위로 만들지 않는다.
- Kafka streaming to Gold를 분석 대표 path의 선행 조건으로 만들지 않는다.
- SparkRunner가 준비되기 전에는 Spark 실행을 발표 필수 조건으로 만들지 않는다.
- real LLM, 외부 vector DB, Iceberg는 이번 분석 대표 path에 포함하지 않는다.
- M3가 Spark session/runtime config를 직접 소유하지 않는다.
- synthetic companion dataset 기반 multi-dataset 분석은 이번 구현 범위가 아니라 후속 리서치다.

## 후속 Phase 연결

| 후속 Phase | 이 문서가 넘기는 결정 |
| --- | --- |
| Phase 4 Existing implementation anchor | 기존 M5 workflow/catalog와 M6 skeleton을 분석 대표 path anchor로 보호한다. |
| Phase 5 M3 JSON main path decision | Amazon Reviews JSON profile/schema/transform spec 최소 범위를 구체화한다. |
| Phase 6 M5 runner boundary decision | local runner, M3 job logic, M2 SparkRunner가 공유할 호출 계약을 확정한다. |

## Phase 3 완료 기준

- 발표 필수 E2E path가 하나로 고정되어 있다.
- Taxi/Kafka가 optional이 아니라 필수 처리/evidence 경로임을 명시한다.
- Taxi/Kafka/M2 SparkRunner가 M6 분석 대표 path의 선행 조건은 아님을 명시한다.
- M1/M3/M5/M6의 분석 대표 path 책임과 완료 기준이 명시되어 있다.
- synthetic companion dataset 기반 multi-dataset 분석을 후속 리서치로 분리한다.
- Phase 4~6이 이어받을 결정 입력이 준비되어 있다.
