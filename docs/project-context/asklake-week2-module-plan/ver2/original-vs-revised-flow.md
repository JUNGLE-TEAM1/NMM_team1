# AskLake Week2 원래 분업과 ver2 흐름 비교

## 기준

원래 분업은 데이터 유형별 병렬 개발에 가깝다. M2는 Taxi 정형 Batch, M3는 Amazon Reviews JSON, M4는 Kafka Streaming을 각각 생산하고, M5/M6/M1이 뒤에서 묶는다.

ver2 분업은 발표 전 E2E 안정화를 위해 책임을 계층별로 다시 나눈다. M2는 runtime, M3는 transformation spec/job logic, M4는 raw Kafka ingestion, M5는 workflow/catalog, M6는 semantic query, M1은 UI/API Gateway를 맡는다.

## 원래 흐름

```text
M1 공통 시작
  - Contract Package
  - API Skeleton
  - UI Shell
  - Demo Tenant
        |
        v
M2 정형 데이터                 M3 JSON 데이터                  M4 스트리밍
  - Taxi PostgreSQL             - Amazon Reviews JSON           - Event Replay
  - Batch Extract/Transform     - Schema Inference              - Kafka Topic/Consumer
  - Bronze/Gold Parquet         - User Override                 - Micro-batch Parquet
  - Metrics/Retry               - Normalize/Silver/Gold         - Lag/Throughput
        \                             |                              /
         \                            |                             /
          v                           v                            v
                  M5 Workflow/Catalog
                    - WorkflowDefinition
                    - Airflow Adapter
                    - local runner fallback
                    - ExecutionResult
                    - Catalog/Lineage
                              |
                              v
                  M6 RAG/AI Query
                    - Metadata Retrieval
                    - KPI Registry
                    - SQL Guardrail
                    - AIQueryResult
                              |
                              v
                  M1 Demo UI
```

## ver2 흐름

```text
외부 입력
  - CSV
  - JSON
  - JSONL
  - Kafka event
        |
        v
M3 Data Processing Spec + ETL Logic       M4 Kafka Ingestion
  - Source profile                         - Topic
  - Schema inference/override              - Producer
  - Flatten/Normalize/Cast                 - Replay command
  - Bronze/Silver/Gold spec                - Raw event contract
  - Quality facts                          - Lag/Throughput/Restart evidence
  - CatalogMetadata facts
        |                                      |
        +------------------+-------------------+
                           |
                           v
M2 Lakehouse Runtime Platform
  - MinIO/S3-compatible storage
  - Spark execution runtime
  - Parquet path convention
  - RuntimeConfig / SparkRunner
  - SQL runtime smoke
                           |
                           v
M5 Workflow Runtime + Catalog Store/API + Lineage
  - WorkflowDefinition
  - Airflow Adapter
  - local runner fallback
  - ExecutionResult
  - Catalog API
  - Lineage
                           |
                           v
M6 Semantic/RAG/AI Query
  - Metadata retrieval
  - Dataset selection evidence
  - SQL planner/guardrail
  - AIQueryResult
                           |
                           v
M1 UI/API Gateway
  - 질문 입력
  - Run 상태
  - Catalog 조회
  - SQL 표시
  - Evidence 표시
  - Fallback 화면
```

## 역할별 변화

| 모듈 | 원래 역할 | ver2 역할 | 핵심 변화 |
| --- | --- | --- | --- |
| M1 | 플랫폼 코어, 공통 계약, UI Shell, Demo Tenant, E2E Smoke | UI/API Gateway, demo tenant, 발표 클릭 흐름 | 공통 계약 최종 소유를 내려놓고 화면과 호출 흐름에 집중한다. |
| M2 | Taxi 정형 Batch, PostgreSQL, Bronze/Gold Parquet, 성능 증거 | Lakehouse Runtime Platform | Taxi 전용 ETL에서 데이터셋 독립 공통 execution runtime 제공으로 이동한다. TLC NYC Taxi Dataset은 정형 빅데이터 ETL 가능성 evidence로 유지한다. |
| M3 | Amazon Reviews JSON Schema, Override, Normalize, Silver/Gold | Data Processing Spec + ETL Logic | JSON 중심에서 CSV/JSON/JSONL transformation spec과 facts 생성으로 확대한다. |
| M4 | Kafka Streaming, Producer, Consumer, Micro-batch Parquet | Kafka Ingestion | Kafka raw input 안정화만 소유하고 transform/Catalog 책임은 넘긴다. |
| M5 | WorkflowDefinition, Airflow Adapter, fallback runner, Catalog/Lineage | Workflow Runtime + Catalog Store/API + Lineage | 실행과 Catalog 저장/API 최종 소유자로 명확화한다. |
| M6 | Metadata RAG, KPI, SQL Guardrail, AI Summary/Chart | Semantic/RAG/AI Query | M3 facts와 M5 Catalog를 소비해 답변/evidence를 생성한다. |

## 겹침 제거 기준

| 겹치던 영역 | ver2 기준 |
| --- | --- |
| Spark runtime | M2가 공통으로 제공한다. |
| Spark job logic | M3가 transformation spec/job logic을 제공한다. |
| Workflow 실행 | M5가 `WorkflowDefinition`으로 runner를 호출한다. |
| Kafka raw input | M4가 topic/replay/raw event를 제공한다. |
| Catalog data facts | M3가 생성한다. |
| Catalog 저장/API | M5가 소유한다. |
| Catalog 검색/답변 | M6가 소유한다. |
| Catalog 화면 | M1이 표시한다. |

## 발표 일정에 반영할 결정

1. M2 역할 변경을 팀에 공유한다. M2는 Taxi Batch만의 독립 ETL 소유자가 아니라 runtime provider이며, TLC NYC Taxi Dataset은 예전 M2 계획과 정형 빅데이터 ETL 가능성을 보여주는 필수 처리 evidence로 사용한다.
2. M3 범위를 과도하게 키우지 않는다. Amazon Reviews JSON 분석 대표 path를 우선하고, Taxi/Kafka는 각각 M2/M4의 필수 처리/evidence 경로로 유지한다.
3. Iceberg는 이번 발표 범위에서 제외한다.
4. `SourceConfig`는 M1 shell과 M3/M4 source-specific provider 구조로 나눈다.
5. M5의 기존 workflow/catalog 구현을 중심 통합 지점으로 사용한다.
