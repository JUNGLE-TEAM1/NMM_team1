# AskLake 2주차 목표 및 6인 모듈 실행 계획

- 기간: 2026.06.25(목) ~ 2026.07.01(수)
- 리뷰 목표일: 2026.07.01(수)
- Context Budget mode: Lite Read
- Primary context: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/15-context-budget-rule.md`, 다운로드 폴더의 1주 MVP/분업/결정/액션 플랜, 2주차 분업 초안 2개

## 1. 이번 주 목표

이번 주의 목표는 Amazon Reviews JSON을 메인 End-to-End로 완주하고, PostgreSQL Batch와 Kafka Streaming은 보조 검증으로 처리 규모와 플랫폼 확장 가능성을 보여주는 것이다.

```text
Amazon Reviews JSON
→ Schema Inference / User Override
→ WorkflowDefinition
→ Airflow 실행 또는 fallback runner 실행
→ S3-compatible Parquet
→ CatalogMetadata
→ Metadata RAG
→ Read-only SQL
→ AI Summary / Chart Spec
```

## 2. 실행 원칙

- 설명보다 동작을 우선한다.
- 기능 수보다 End-to-End 연결을 우선한다.
- UI 완성도보다 실제 데이터 흐름과 실행 증거를 우선한다.
- 새 기능보다 통합 장애 해결을 우선한다.
- 2026.06.29 종료 후 Dataset, 질문, SQL, UI 클릭 순서를 변경하지 않는다.
- 계약 변경은 오전 미팅에서 공유하고, 변경된 Fixture JSON을 같은 날 갱신한다.

## 3. 범위

### 포함

- 고정 Demo Tenant와 `tenant_id` 기반 데이터 모델
- Source 3종: Amazon Reviews JSON, PostgreSQL Taxi, Kafka Event
- JSON Schema Inference, User Override, Normalize
- Workflow Node 5종: Source, Select/Filter, Cast/Normalize, Aggregate, Load
- Airflow 실행. 단, Airflow가 막히면 같은 계약으로 fallback runner 실행
- S3-compatible 저장소에 Parquet 적재
- Catalog 자동 등록, Dataset-level Lineage, Status/Log/Retry
- Metadata RAG, KPI 1-2개, Read-only SQL Guardrail
- AI Summary와 Chart Spec
- Source, Schema Preview, Run Status, Catalog, AI Query 결과 최소 화면

### 제외

- 완전한 로그인, 실제 멀티테넌시, 과금
- 자체 스케줄러 또는 완성형 Mini Airflow
- 자유 캔버스 DAG, Backfill, Column-level Lineage
- 실시간 데이터의 AI Query 연결
- 자유 Dashboard 편집/공유
- 고급 IAM, 고급 거버넌스, 복잡한 Rule Engine
- 전체 리뷰 원문 임베딩
- 프로덕션 수준 배포 자동화

## 4. Day 0 / Day 1 필수 결정

| 항목 | 권장안 | 상태 |
|---|---|---|
| 메인 시나리오 | Amazon Reviews JSON End-to-End | 결정: 추천안 |
| SQL Engine | Adapter 구조로 설계. MVP 구현체는 DuckDB, 후속 후보는 Trino/Athena | 결정: Adapter + DuckDBSqlEngine |
| Storage | MinIO 또는 local S3-compatible path 우선 | 결정: MinIO |
| Airflow fallback | `WorkflowDefinition`을 local runner로 실행 | 결정: Airflow 실패 시 local runner 전환 |
| Tenant/Auth | 로그인 없이 Demo Tenant 고정 | 결정: 추천안 |
| 검증 질문 | 통합된 코드와 실제 데이터 기준으로 Day 4 확정 | 결정: Day 1 후보 고정 없이 진행 |
| Amazon Reviews 범위 | Demo sample, fixed sample, extended sample 단계 | 결정: 단계 방식. 세부 경로/row 수는 공통 계약 설계 때 확정 |
| Taxi 범위 | dataset, rows, date range, Gold query 고정 | TODO |
| Kafka 범위 | event-time column, topic, replay rate 고정 | TODO |
| Daily Integration | 매일 오후 Main E2E Smoke 시간 고정 | TODO |

## 5. 6인 모듈 구조

| 모듈 | 담당자 | 핵심 미션 | 필수 산출물 | 완료 증거 |
|---|---|---|---|---|
| M1 플랫폼 코어·통합 | 박태정 | 공통 계약, API, UI Shell, Demo Tenant, E2E Smoke | Contract Package, Core API, UI Shell, Runbook | Day 5에 실제 서비스로 메인 클릭 흐름 완주 |
| M2 정형 Batch | 염태선 | Taxi Batch 처리와 성능 증거 | Batch Task, Bronze/Gold Parquet, Metrics, Retry 기록 | PostgreSQL → S3 Parquet 재현 |
| M3 JSON·Schema | 이원재 | 메인 JSON 스키마 추론·보정·정규화 | Inferred Schema, Override Schema, Normalize Task, Silver/Gold | JSON 등록 → 수정 → Parquet 변환 |
| M4 Kafka Streaming | 황선호 | 이벤트 재생부터 S3 적재 | Producer, Topic, Consumer, Partitioned Parquet, Lag/Throughput | Kafka 수신·지속 적재·재시작 확인 |
| M5 Workflow·Catalog | 이해건 | Workflow를 Airflow와 Catalog로 연결 | WorkflowDefinition, Airflow Adapter, ExecutionResult, Catalog/Lineage | Workflow 실행 후 Dataset 자동 등록 |
| M6 RAG·AI Query | 유중일 | 질문을 Dataset·SQL·수치·요약·차트로 연결 | Metadata Index, KPI Registry, SQL Guardrail, AIQueryResult | 검증 질문 3개 실제 수치 반환 |

## 6. 모듈별 목표

### M1 플랫폼 코어·통합

목표:

- 모든 모듈이 같은 ID, 요청, 응답 규칙으로 붙도록 공통 기준을 만든다.
- UI Shell에서 Source, Schema Preview, Run Status, Catalog, AI Query 화면을 연결한다.

소유 범위:

- 공통 ID 규칙
- Demo Tenant
- API Skeleton
- Fixture JSON 위치와 형식
- UI Route와 통합 화면
- E2E Runbook과 Smoke Test

소유하지 않는 범위:

- Source별 추출 로직
- Airflow Task 내부 구현
- RAG, SQL 생성, AI 요약 로직

첫 산출물:

- Day 1 정오 전 `contracts/*.sample.json`
- 모듈별 세부 Day 1 산출물은 다음날 통합된 코드 상태를 보고 유연하게 조정
- API endpoint 초안
- 화면 route 초안

### M2 정형 Batch

목표:

- Taxi 데이터를 PostgreSQL에서 읽어 Parquet으로 저장하고 처리 규모를 증명한다.

소유 범위:

- Taxi 데이터 범위 확정
- PostgreSQL 적재와 Connection Test
- Batch Extract / Transform
- Bronze/Gold Parquet
- row count, bytes, duration, Retry 기록
- CatalogMetadata 전달

완료 문장:

```text
PostgreSQL에서 읽은 Taxi 데이터가 S3-compatible Parquet과 Catalog에 남고, 처리 규모가 숫자로 기록된다.
```

### M3 JSON·Schema

목표:

- Amazon Reviews JSON을 메인 데모에 쓸 수 있는 분석 가능한 데이터셋으로 만든다.

소유 범위:

- Category, file, sample size 고정
- Sample Reader
- field path, type, nullable, missing, nested kind 추론
- User Override
- Flatten/Explode/Cast 최소 1개
- Silver/Gold Parquet
- CatalogMetadata 전달

완료 문장:

```text
JSON 등록, 스키마 추론, 사용자 수정, Parquet 변환이 이어지고 수정 내용이 출력 Schema에 반영된다.
```

### M4 Kafka Streaming

목표:

- 실시간 데이터의 필수 범위인 Event Replay, Kafka 수신, S3 적재, 처리량 측정을 독립적으로 완성한다.

소유 범위:

- Event-time column, event type, replay rate 확정
- Producer, Topic, Consumer
- Schema Validation
- Micro-batch Parquet
- Partition path
- throughput, consumer lag, error count, restart result

완료 문장:

```text
파일 이벤트가 Kafka로 재생되고 S3-compatible Parquet에 지속 적재되며 처리량과 Lag가 기록된다.
```

### M5 Workflow·Catalog

목표:

- 각 데이터 모듈의 작업을 동일한 Workflow 모델로 실행하고 상태, 로그, 저장, Lineage를 표준화한다.

소유 범위:

- WorkflowDefinition
- Node 5종
- Airflow Adapter
- fallback runner
- Trigger, Status, Log, Retry
- S3 Path, Naming, Partition 규칙
- Dataset-level Lineage
- Catalog 등록 호출

완료 문장:

```text
M3의 메인 Workflow가 저장, 실행, 관측되고 성공 시 Dataset과 Lineage가 Catalog에 등록된다.
```

### M6 RAG·AI Query

목표:

- CatalogMetadata를 이용해 질문에 맞는 Dataset을 고르고 실제 SQL 수치와 근거 있는 결과를 반환한다.
- DuckDB, Trino, Athena 같은 구체 엔진에 직접 의존하지 않고 `SqlEngineAdapter`를 통해 실행한다.

소유 범위:

- Metadata Document Format
- Vector 또는 Hybrid Index
- Dataset Retrieval과 검색 근거
- KPI Registry 1-2개
- SELECT-only, table allowlist, timeout, limit 검증
- `SqlEngineAdapter` 호출과 SQL 실행 결과 표준화
- Summary, Chart Spec
- 검증 질문 3개와 정답 SQL

완료 문장:

```text
자연어 질문 3개가 Dataset Retrieval, SQL, 실제 수치, 요약, Chart Spec으로 재현 가능하게 실행된다.
```

## 7. 공통 계약

Day 1 정오까지 Fixture JSON을 만든다. 실제 구현이 늦어도 소비 모듈은 Fixture로 계속 개발한다.

| 계약 | Producer | Consumer | 필수 필드 |
|---|---|---|---|
| `SourceConfig` | M1 | M2, M3, M4, M5 | `tenant_id`, `source_id`, `source_type`, `name`, `connection_ref`, `options`, `created_at` |
| `SchemaDefinition` | M3 중심, M2/M4 보조 | M1, M5, M6 | `source_id`, `schema_version`, `fields[path,type,nullable,array,override]`, `sample_size` |
| `WorkflowDefinition` | M1/M5 | M5 | `pipeline_id`, `nodes`, `edges`, `retry`, `target_dataset`, `schedule` |
| `ExecutionResult` | M2, M3, M4, M5 | M1, M5, M6 | `run_id`, `status`, `timestamps`, `row_count`, `bytes`, `outputs`, `error` |
| `CatalogMetadata` | M2, M3, M4, M5 | M1, M6 | `dataset_id`, `version`, `layer`, `s3_uri`, `schema`, `metrics`, `lineage`, `updated_at` |
| `AIQueryResult` | M6 | M1 | `question`, `selected_datasets`, `evidence`, `sql`, `rows`, `summary`, `chart_spec`, `executed_at` |

권장 저장 위치:

```text
contracts/source_config.sample.json
contracts/schema_definition.sample.json
contracts/workflow_definition.sample.json
contracts/execution_result.sample.json
contracts/catalog_metadata.sample.json
contracts/ai_query_result.sample.json
```

## 8. SQL Engine Adapter 계약

SQL Engine은 DuckDB로 고정하지 않는다. 이번 주에는 DuckDB를 첫 구현체로 사용하되, M6와 API는 엔진 구현체를 직접 알지 않도록 Adapter를 둔다.

```text
AI Query / M6
→ SqlEngineAdapter
→ DuckDBSqlEngine
→ Parquet / S3-compatible path / CatalogMetadata
```

후속 확장 후보:

```text
TrinoSqlEngine
AthenaSqlEngine
SparkSqlEngine
```

### 8.1 MVP 최소 인터페이스

```text
validate(sql, context) -> ValidationResult
execute(sql, context) -> QueryResult
explain_schema(dataset) -> DatasetSchema
health_check() -> EngineHealth
```

### 8.2 공통 책임 분리

| 책임 | 담당 |
|---|---|
| 질문에서 Dataset 후보 선택 | Metadata RAG |
| SQL 생성 | M6 LLM/Template |
| SELECT-only, table allowlist, timeout, limit 검증 | 공통 Guardrail + `SqlEngineAdapter.validate` |
| SQL 실행 | 현재 선택된 Engine Adapter |
| Dataset 위치 해석 | Engine Adapter가 `CatalogMetadata.s3_uri` 또는 local path를 해석 |
| 결과 표준화 | Engine Adapter가 `QueryResult`로 반환 |
| 요약·Chart Spec 생성 | M6 |

### 8.3 환경 변수

```text
SQL_ENGINE=duckdb
SQL_TIMEOUT_SECONDS=30
SQL_DEFAULT_LIMIT=100
SQL_ALLOW_TABLES=reviews_silver,reviews_gold
```

### 8.4 MVP 구현 기준

- M6 코드에서 DuckDB, Trino, Athena client를 직접 import하지 않는다.
- DuckDB는 `DuckDBSqlEngine` 내부에만 둔다.
- `AIQueryResult`는 엔진 종류와 무관하게 같은 형식으로 반환한다.
- 엔진 교체는 `SQL_ENGINE` 설정과 Adapter 구현체 추가로 처리한다.
- 이번 주에는 DuckDB 기능에 맞춰 SQL을 단순하게 유지한다.

### 8.5 QueryResult 공통 형식

```json
{
  "engine": "duckdb",
  "sql": "SELECT product_id, COUNT(*) AS review_count FROM reviews_silver GROUP BY product_id LIMIT 10",
  "columns": [
    {"name": "product_id", "type": "string"},
    {"name": "review_count", "type": "integer"}
  ],
  "rows": [
    {"product_id": "B001", "review_count": 42}
  ],
  "row_count": 1,
  "duration_ms": 128,
  "executed_at": "2026-06-25T14:00:00+09:00"
}
```

## 9. 일별 Gate

| 일정 | Gate | 팀 전체 목표 | 최소 증거 |
|---|---|---|---|
| 6/25 Day 1 | 계약과 Source | 공통 계약 Fixture를 만들고, Source 3종과 JSON Schema Prototype은 통합 코드 상태에 맞춰 유연하게 조정 | `contracts/*.sample.json`, Source 연결 로그, Schema Preview |
| 6/26 Day 2 | 첫 실제 처리 | 첫 Parquet, Airflow Trigger/Status, Retrieval Prototype | S3/local path, `ExecutionResult`, 검색 후보 |
| 6/27 Day 3 | S3·Catalog | 메인 JSON의 Source → S3 → Catalog 실제 동작 | `CatalogMetadata`, Lineage, row count |
| 6/28 Day 4 | RAG·SQL·AI | 통합된 코드와 실제 데이터 기준으로 질문을 확정하고 Dataset → SQL → 결과를 연결 | 확정 질문, SQL, result rows, summary, chart spec |
| 6/29 Day 5 | E2E 통합·Freeze | UI 클릭 흐름 완주, Dataset/질문/SQL/클릭 순서 동결 | Demo script, 고정 질문, 고정 SQL |
| 6/30 Day 6 | 안정화·측정 | E2E 5회, 실패·Retry, 성능 측정, 백업 영상 | 반복 실행표, 측정표, 영상 |
| 7/1 Review | 시연 | 메인 E2E, Taxi 규모, Kafka 처리량, 현재 한계 발표 | 리뷰 시연 |

## 10. 검증 질문 3개

검증 질문은 Day 1에 미리 고정하지 않는다. Day 4에 통합된 코드와 실제 데이터 상태를 기준으로 3개를 확정한다.

운영 의도:

- M3/M5/M6가 먼저 실제 데이터 흐름을 붙인다.
- 질문은 구현된 Schema, Catalog, SQL 가능 범위 안에서 확정한다.
- 질문 확정 후에는 Dataset, SQL, UI 표시 항목을 6/29 Freeze 기준에 포함한다.

| 번호 | 질문 | 예상 Dataset | 필요한 컬럼/KPI | 정답 SQL | 예상 결과 |
|---|---|---|---|---|---|
| 1 | Day 4 확정 | TODO | TODO | TODO | TODO |
| 2 | Day 4 확정 | TODO | TODO | TODO | TODO |
| 3 | Day 4 확정 | TODO | TODO | TODO | TODO |

## 11. 위험과 대응

| 위험 | 영향 | 대응 |
|---|---|---|
| M1/M5/M6 병목 | 통합과 AI 결과가 후반에 몰림 | M2/M4가 안정되면 M5/M6 지원으로 이동 |
| Airflow 세팅 지연 | Workflow 실행 전체 차단 | 같은 `WorkflowDefinition`을 fallback runner로 실행 |
| S3/AWS 인증 문제 | 저장·조회 실패 | MinIO 또는 local path fallback |
| SQL Engine 결정 지연 | M6 구현 지연 | Adapter 계약을 먼저 고정하고 DuckDB 구현체로 시작 |
| SQL Engine 과추상화 | MVP 구현 속도 저하 | 최소 메서드 4개와 `QueryResult` 형식만 고정 |
| 검증 질문 확정 지연 | M6 결과 검산과 UI Freeze가 밀릴 수 있음 | Day 4에는 반드시 3개를 확정하고 6/29 이후 변경하지 않음 |
| Schema 불일치 | Catalog와 SQL 실패 | `SchemaDefinition`을 단일 원천으로 사용하고 Day 3 대조 |
| 데이터 규모 과다 | 처리 지연 | demo sample, fixed sample, extended sample 순서로 확장 |
| LLM/API 실패 | 결과 생성 실패 | 고정 mock response, cache, 정답 SQL 결과 준비 |
| UI 과투자 | 실제 흐름 미완성 | Form/JSON 기반 최소 UI로 제한 |

## 12. Cut Line

일정이 부족하면 아래 순서로 제외한다.

1. 로그인/RBAC, Dashboard 저장, 고급 UI
2. 실시간 데이터의 AI Query 연결
3. 자유 캔버스 DAG, 증분 색인, Column-level Lineage, Backfill
4. 추가 Dataset, 추가 Category, 추가 Gold Table

아래는 제외하지 않는다.

- Amazon Reviews JSON의 Source 등록과 Schema Override
- Workflow 실행 또는 fallback 실행
- S3-compatible Parquet과 Catalog 자동 등록
- Metadata RAG의 Dataset 선택 근거
- Read-only SQL 실행과 정답 수치 검산
- 결과 화면의 Dataset, SQL, 실행 시각, Chart

## 13. 매일 Evidence 제출 형식

각 모듈은 하루 종료 전 아래를 남긴다.

```text
Date:
Module:
Owner:
Run ID:
Executed command or screen:
Input source or file:
Output S3/local path:
row_count:
bytes:
duration:
Produced JSON:
Consumer module:
Blocked issue:
Next first action:
```

## 14. 최종 Definition of Done

- Mock만이 아니라 실제 Source, Workflow 실행, Parquet 저장, SQL 실행 증거가 있다.
- 최소 1개 Dataset이 Source부터 AI 결과까지 하나의 `run_id` 또는 연결 가능한 ID 흐름으로 추적된다.
- 검증 질문 3개의 화면 수치가 정답 SQL과 일치한다.
- Dataset, SQL, 검색 근거, 실행 시각이 결과 화면에 노출된다.
- Taxi Batch의 처리 행 수, 파일 크기, 실행 시간이 기록된다.
- Kafka Streaming의 처리량, Lag, S3 partition이 기록된다.
- 실패 Task 또는 Consumer 재시작 상황을 한 번 검증했다.
- 6/30에 메인 E2E를 5회 반복했고 결과를 기록했다.
- secret, API key, token, private key가 문서나 코드에 포함되지 않았다.
