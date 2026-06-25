# AskLake 이번 주 목표 및 6인 분업 - 미팅용 요약

- 기간: 2026.06.25(목) ~ 2026.07.01(수)
- 리뷰 목표: 2026.07.01(수) 실제 End-to-End 시연
- 문서 목적: 팀 미팅에서 이번 주 목표, 역할, 결정사항, Cut Line을 빠르게 합의한다.

## 1. 이번 주 한 문장 목표

Amazon Reviews JSON을 메인 End-to-End로 완주하고, PostgreSQL Batch와 Kafka Streaming은 처리 규모와 확장 가능성을 증명한다.

```text
Amazon Reviews JSON
→ Schema Inference / Override
→ Workflow / Airflow
→ S3 Parquet
→ Catalog / Metadata RAG
→ SQL
→ AI Summary / Chart
```

## 2. 이번 주 성공 기준

| 구분 | 목표 | 완료 증거 |
|---|---|---|
| 메인 E2E | Amazon JSON 등록부터 AI 결과까지 한 흐름 완주 | Run ID, S3 Path, Catalog, SQL, 결과 화면, 실행 영상 |
| 정형 검증 | Taxi 데이터를 PostgreSQL에서 읽어 S3 Parquet으로 저장 | row count, file size, duration, Retry 결과 |
| 실시간 검증 | 이벤트 파일을 Kafka로 재생하고 S3 Parquet에 적재 | throughput, consumer lag, partition path, 재시작 결과 |
| 정확성 | 검증 질문 3개의 화면 수치와 정답 SQL 일치 | 질문별 Dataset, SQL, expected result 표 |
| 반복성 | 6/30에 메인 E2E 5회 반복 실행 | 성공/실패 기록과 수정 내역 |

## 3. 6인 모듈 분업

| 모듈 | 핵심 미션 | 이번 주 완료 문장 |
|---|---|---|
| M1 플랫폼 코어·통합 | 공통 ID, API, UI Shell, Demo Tenant, E2E Smoke | 서비스 화면에서 메인 흐름을 클릭 순서대로 완주한다. |
| M2 정형 Batch | Taxi PostgreSQL Batch, Bronze/Gold, 성능 측정 | PostgreSQL에서 읽은 데이터가 S3 Parquet과 Catalog에 남는다. |
| M3 JSON·Schema | Amazon Reviews Schema 추론, Override, 정규화 | JSON 등록, 스키마 수정, Parquet 변환이 이어진다. |
| M4 Kafka Streaming | Event Replay, Kafka 수신, Micro-batch 저장 | 이벤트가 Kafka를 거쳐 S3 Parquet에 지속 적재된다. |
| M5 Workflow·Catalog | Workflow JSON, Airflow, Status/Log/Retry, Catalog/Lineage | Workflow 실행 후 Dataset과 Lineage가 자동 등록된다. |
| M6 RAG·AI Query | Metadata Retrieval, KPI, SQL Guardrail, Summary/Chart | 자연어 질문 3개가 실제 SQL 수치와 AI 결과로 반환된다. |

## 4. 오늘 미팅에서 바로 결정할 것

| 항목 | 권장안 | 결정 |
|---|---|---|
| 메인 데이터 | Amazon Reviews JSON | Amazon Reviews JSON |
| 보조 데이터 | Taxi Batch, Kafka Event | Taxi Batch + Kafka Event |
| SQL Engine | Adapter 구조로 설계. MVP 구현체는 DuckDB, 후속 후보는 Trino/Athena | Adapter + DuckDBSqlEngine |
| Storage | MinIO 또는 local S3-compatible path 우선, AWS S3는 선택 | MinIO |
| Airflow 실패 fallback | 같은 `WorkflowDefinition`을 local runner로 실행 | Airflow 실패 시 local runner 전환 |
| Tenant/Auth | 로그인 없이 Demo Tenant 고정, 모든 엔티티에 `tenant_id` 포함 | Demo Tenant 고정 + `tenant_id` 포함 |
| Workflow Node | Source, Select/Filter, Cast/Normalize, Aggregate, Load | Source, Select/Filter, Cast/Normalize, Aggregate, Load |
| 품질 검사 | Schema 일치, Row Count | Schema 일치 + Row Count |
| 검증 질문 | Day 4에 통합된 코드와 실제 데이터 기준으로 확정 | Day 1 후보 고정 없이 진행 |
| 데이터 범위 | Demo sample + fixed sample + extended sample 단계 | 세부 경로/row 수는 공통 계약 설계 때 확정 |

## 5. 공통 계약

Day 1 정오까지 아래 Fixture JSON을 먼저 만든다. 실제 구현이 늦어도 소비 모듈은 Fixture로 계속 개발한다.

```text
contracts/source_config.sample.json
contracts/schema_definition.sample.json
contracts/workflow_definition.sample.json
contracts/execution_result.sample.json
contracts/catalog_metadata.sample.json
contracts/ai_query_result.sample.json
```

핵심 ID:

```text
tenant_id, source_id, pipeline_id, run_id, dataset_id, dataset_version
```

SQL Engine 교체 원칙:

```text
M6는 DuckDB/Trino/Athena를 직접 호출하지 않는다.
M6 → SqlEngineAdapter → DuckDBSqlEngine 순서로 연결한다.
후속 교체는 TrinoSqlEngine 또는 AthenaSqlEngine 구현체를 추가하는 방식으로 한다.
환경 변수 예시: SQL_ENGINE=duckdb
공통 응답 형식: QueryResult
```

MVP에서 고정할 최소 메서드:

```text
validate(sql, context)
execute(sql, context)
explain_schema(dataset)
health_check()
```

## 6. 일별 Gate

| 날짜 | Gate | 최소 증거 |
|---|---|---|
| 6/25 Day 1 | 계약과 Source | Fixture JSON, Source 3종 증거, JSON Schema Prototype |
| 6/26 Day 2 | 첫 실제 처리 | 첫 Parquet, Workflow 실행, Retrieval Prototype |
| 6/27 Day 3 | S3·Catalog | 메인 JSON의 Source → S3 → Catalog 실제 동작 |
| 6/28 Day 4 | RAG·SQL·AI | 통합된 코드와 실제 데이터 기준으로 질문 3개 확정 후 Dataset → SQL → 결과 연결 |
| 6/29 Day 5 | E2E 통합·Freeze | UI 클릭 흐름, Dataset/질문/SQL/클릭 순서 동결 |
| 6/30 Day 6 | 안정화·측정 | E2E 5회, 성능 수치, Retry, 백업 영상 |
| 7/1 Review | 시연 | 메인 E2E + Taxi 규모 + Kafka 처리량 + 한계 |

## 7. 일정 부족 시 자를 것

먼저 자른다:

1. 로그인/RBAC, Dashboard 저장, 고급 UI
2. 실시간 데이터의 AI Query 연결
3. 자유 캔버스 DAG, Backfill, Column-level Lineage
4. 추가 Dataset, 추가 Category, 추가 Gold Table

자르면 안 된다:

- Amazon JSON Schema Override
- Workflow/Airflow 실행 또는 fallback 실행
- S3 Parquet과 Catalog 자동 등록
- Metadata RAG의 Dataset 선택 근거
- Read-only SQL 실행과 정답 수치 검산
- 결과 화면의 Dataset, SQL, 실행 시각, Chart

## 8. 매일 제출할 Evidence

각 모듈은 하루 종료 전 아래를 남긴다.

```text
오늘 실행한 명령 또는 화면
Run ID
입력 Source 또는 파일
출력 S3 Path 또는 local path
row_count / bytes / duration
다음 모듈이 소비할 JSON
막힌 점 1개와 내일 첫 작업
```

## 9. 미팅 결론 기록

| 항목 | 결정 |
|---|---|
| 메인 데이터 | Amazon Reviews JSON |
| 보조 데이터 | Taxi Batch + Kafka Event |
| SQL Engine Adapter / MVP 구현체 | Adapter 구조 + DuckDBSqlEngine |
| Storage 방식 | MinIO |
| Airflow fallback | Airflow 실패 시 local runner로 전환 |
| Tenant/Auth | Demo Tenant 고정 + 모든 주요 엔티티에 `tenant_id` 포함 |
| Workflow Node | Source, Select/Filter, Cast/Normalize, Aggregate, Load |
| 품질 검사 | Schema 일치 + Row Count |
| 메인 검증 질문 3개 | Day 4에 통합된 코드와 실제 데이터 기준으로 확정 |
| Amazon Reviews 데이터 범위 | Demo sample + fixed sample + extended sample 단계. 세부 경로/row 수는 공통 계약 설계 때 확정 |
| Day 1 산출물 | 공통 계약 Fixture는 Day 1에 만들고, 모듈별 세부 산출물은 다음날 통합된 코드 상태를 보고 유연하게 확정 |
| 담당자 배정 | M1 박태정, M2 염태선, M3 이원재, M4 황선호, M5 이해건, M6 유중일 |
| Daily Integration 시간 | 미정 - 다음 통합 코드 상태 확인 후 확정 |
| 6/29 Freeze 기준 | Dataset, 질문, SQL, UI 클릭 순서. 세부 기준은 Day 5 E2E 통합 후 확정 |
