# AskLake Week2 ver2 Main E2E Path

## 목적

이 문서는 Week2 발표와 병렬 구현의 기준이 되는 main E2E path를 하나로 고정한다.

Phase 2의 구현 전환 계획은 기존 구현을 유지한 채 adapter-first로 전환하는 방향을 정했다. Phase 3은 그 위에서 발표 필수 경로를 Amazon Reviews JSON 중심으로 확정한다.

## 확정 경로

```text
Amazon Reviews JSON
-> M3 profile/schema/transform spec
-> M5 WorkflowDefinition / existing local runner
-> M5 Catalog
-> M6 AI Query
-> M1 UI
```

이 경로는 발표에서 반드시 동작해야 하는 최소 end-to-end 흐름이다.

## 모듈별 책임

| 모듈 | main path 책임 | 완료 기준 |
| --- | --- | --- |
| M1 | run/catalog/query/evidence 상태를 클릭 흐름으로 보여준다. | M5/M6 API 결과를 화면에서 확인할 수 있다. |
| M3 | Amazon Reviews JSON을 inspect/profile하고 schema/transform spec을 만든다. | JSON sample에서 profile facts와 최소 `TransformSpec` shape가 나온다. |
| M5 | `WorkflowDefinition`을 받아 local runner로 실행하고 Catalog metadata를 저장/노출한다. | run 결과와 Catalog entry가 같은 `run_id`/dataset context로 이어진다. |
| M6 | M5 Catalog를 기반으로 AI Query skeleton을 응답 경로에 연결한다. | fixture-only 설명이 아니라 Catalog metadata를 근거로 답한다. |

## M2와 M4의 위치

M2 SparkRunner와 M4 Kafka는 main path를 막는 선행 조건이 아니다.

| 영역 | 이번 main path에서의 역할 | 이유 |
| --- | --- | --- |
| M2 SparkRunner | Phase 6 runner boundary 결정 뒤 붙일 runtime implementation | 발표 필수 경로는 기존 local runner로 먼저 닫는다. |
| M4 Kafka | raw ingestion/replay evidence | Kafka replay는 스트리밍 증거로 유지하지만 JSON main path를 막지 않는다. |
| Taxi dataset | scale/structured batch evidence | 대용량 증거로 사용할 수 있지만 발표 필수 경로는 Amazon Reviews JSON으로 고정한다. |

## 데이터셋 기준

main path의 첫 데이터셋은 Amazon Reviews JSON 또는 그와 같은 JSON/JSONL sample이다.

- JSON object 또는 JSONL record를 읽을 수 있어야 한다.
- schema/profile 단계는 nested field, optional field, array/object field를 최소한 facts로 남긴다.
- transformation은 처음부터 full ETL이 아니라 발표에 필요한 select/flatten/normalize 수준으로 제한한다.
- output은 M5 Catalog와 M6 query가 읽을 수 있는 metadata facts를 남긴다.

## 발표 성공 조건

1. 사용자가 M1에서 demo source 또는 run을 선택한다.
2. M5가 Amazon Reviews JSON 기반 workflow를 실행하거나 실행 결과를 조회한다.
3. M5 Catalog에서 dataset/run/output metadata를 확인할 수 있다.
4. M6가 Catalog metadata를 근거로 질문에 답한다.
5. M1이 run, catalog, query, evidence 상태를 한 흐름으로 보여준다.

## 제외 범위

- Taxi full ETL을 main path 필수 조건으로 만들지 않는다.
- Kafka streaming to Gold를 main path 필수 조건으로 만들지 않는다.
- SparkRunner가 준비되기 전에는 Spark 실행을 발표 필수 조건으로 만들지 않는다.
- real LLM, 외부 vector DB, Iceberg는 이번 main path에 포함하지 않는다.
- M3가 Spark session/runtime config를 직접 소유하지 않는다.

## 후속 Phase 연결

| 후속 Phase | 이 문서가 넘기는 결정 |
| --- | --- |
| Phase 4 Existing implementation anchor | 기존 M5 workflow/catalog와 M6 skeleton을 main path anchor로 보호한다. |
| Phase 5 M3 JSON main path decision | Amazon Reviews JSON profile/schema/transform spec 최소 범위를 구체화한다. |
| Phase 6 M5 runner boundary decision | local runner, M3 job logic, M2 SparkRunner가 공유할 호출 계약을 확정한다. |

## Phase 3 완료 기준

- 발표 필수 E2E path가 하나로 고정되어 있다.
- Taxi/Kafka/SparkRunner가 main path 선행 조건이 아님을 명시한다.
- M1/M3/M5/M6의 main path 책임과 완료 기준이 명시되어 있다.
- Phase 4~6이 이어받을 결정 입력이 준비되어 있다.
