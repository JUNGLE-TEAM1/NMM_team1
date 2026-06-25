# AskLake 2주차 모듈 분업 결정 로그

## 1. 문서 목적

이 문서는 AskLake 2주차 모듈 분업 미팅에서 확정된 결정을 하네스가 다음 작업 맥락으로 사용할 수 있게 정리한다.

`plan.md`는 실행 계획이고, `decision-options.md`는 옵션 비교와 회의 판단 근거다. 이 문서는 다음 작업자가 빠르게 확인해야 할 최종 결정, 담당자, 아직 확정하지 않은 세부 계약, 실행 원칙만 모은다.

문서 간 표현이 충돌할 경우 이 파일의 최종 결정 요약을 우선 기준으로 본다.

아직 `docs/02-architecture.md`, `docs/03-interface-reference.md` 같은 Source of Truth에 바로 반영할 수준으로 세부 계약이 확정된 것은 아니다. MinIO path, sample row 수, 계약 JSON 필드 세부값, 실제 Python interface 위치 등은 공통 계약 설계 때 확정한다.

## 2. 최종 결정 요약

| 항목 | 결정 | 이유 | 영향 모듈 |
|---|---|---|---|
| 메인 데이터 | Amazon Reviews JSON | JSON Schema Inference, Override, Catalog, RAG, SQL, AI 결과까지 AskLake의 핵심 차별점이 잘 드러난다. | M3, M5, M6 |
| 보조 데이터 | Taxi Batch + Kafka Event | 정형 Batch 규모 증거와 실시간 적재 증거를 함께 확보한다. | M2, M4 |
| SQL Engine | Adapter 구조 + `DuckDBSqlEngine` | MVP에서는 빠르게 DuckDB로 구현하되, 후속 Trino/Athena 교체 가능성을 남긴다. | M6, M1 |
| Storage | MinIO | S3-compatible 흐름을 로컬에서 안정적으로 재현한다. | M2, M3, M4, M5 |
| Airflow | 실패 시 local runner 전환 | Airflow 목표를 유지하되, Airflow 환경 문제가 메인 E2E 전체를 막지 않게 한다. | M5 |
| Tenant/Auth | Demo Tenant 고정 + 모든 주요 엔티티에 `tenant_id` 포함 | 로그인/RBAC 구현 부담은 줄이고 B2B SaaS 확장 구조는 유지한다. | M1 |
| Workflow Node | Source, Select/Filter, Cast/Normalize, Aggregate, Load | 메인 E2E에 필요한 최소 DAG 표현을 유지하면서 구현 범위를 제한한다. | M5, M1 |
| 품질 검사 | Schema 일치 + Row Count | Catalog, SQL 검산, 처리 증거에 직접 필요한 최소 품질 기준이다. | M3, M5 |
| 검증 질문 | Day 4에 통합된 코드와 실제 데이터 기준으로 확정. Day 1 후보 고정 없음 | 질문을 미리 고정하지 않고 구현 결과와 실제 Schema에 맞춰 결정한다. | M3, M6 |
| 데이터 범위 | Demo sample + fixed sample + extended sample 단계 | 작은 E2E부터 붙이고, 발표 수치는 단계적으로 보강한다. | M2, M3, M4 |

## 3. 모듈 담당자

| 모듈 | 담당자 | 핵심 책임 |
|---|---|---|
| M1 플랫폼 코어·통합 | 박태정 | 공통 계약, API Skeleton, UI Shell, Demo Tenant, E2E Smoke |
| M2 정형 Batch | 염태선 | Taxi PostgreSQL Batch, Bronze/Gold Parquet, 처리 규모와 Retry 증거 |
| M3 JSON·Schema | 이원재 | Amazon Reviews Schema Inference, User Override, Normalize, Silver/Gold Dataset |
| M4 Kafka Streaming | 황선호 | Event Replay, Kafka Topic/Consumer, Micro-batch Parquet, 처리량과 Lag |
| M5 Workflow·Catalog | 이해건 | WorkflowDefinition, Airflow Adapter, local runner fallback, Status/Log/Retry, Catalog/Lineage |
| M6 RAG·AI Query | 유중일 | Metadata RAG, KPI, SQL Guardrail, `SqlEngineAdapter`, AI Summary/Chart |

## 4. 공통 계약 설계 때 확정할 항목

아래 항목은 지금 임의로 확정하지 않는다. 공통 계약 설계 작업에서 `contracts/*.sample.json`, `plan.md`, 필요 시 Source of Truth 반영 여부를 함께 결정한다.

| 항목 | 확정 시점 | 기록 위치 |
|---|---|---|
| MinIO bucket/path 규칙 | 공통 계약 설계 때 | `contracts/catalog_metadata.sample.json`, `plan.md` |
| Amazon Reviews demo/fixed/extended sample의 실제 파일 경로와 row 수 | 공통 계약 설계 때 | `plan.md`, M3 작업 문서 |
| `contracts/*.sample.json`의 필드 세부값 | 공통 계약 설계 때 | `contracts/`, 필요 시 `docs/03-interface-reference.md` 제안 |
| `SqlEngineAdapter`의 실제 Python 인터페이스 위치 | M6 구현 전 계약 설계 때 | `contracts/`, 구현 계획, 필요 시 `docs/03-interface-reference.md` 제안 |
| local runner 전환 조건의 구체 기준 | M5 구현 전 계약 설계 때 | `plan.md`, M5 작업 문서 |

## 5. 지금은 결정하지 않을 항목

아래 항목은 이번 주 메인 E2E 성공에 필수 결정이 아니므로 지금 확정하지 않는다.

| 항목 | 보류 이유 | 재검토 시점 |
|---|---|---|
| Trino/Athena 도입 | DuckDB Adapter로 MVP를 먼저 완주한다. | MVP SQL 흐름 안정화 이후 |
| AWS S3 전환 | MinIO로 S3-compatible 흐름을 먼저 안정화한다. | MinIO E2E 성공 이후 |
| 실제 로그인/RBAC | Demo Tenant와 `tenant_id`로 구조만 열어둔다. | E2E 안정화 이후 |
| 자유 Canvas DAG | Node 5종과 실행 가능성을 우선한다. | Workflow 실행/관측 안정화 이후 |
| Column-level Lineage | Dataset-level Lineage로 MVP 증거를 충분히 만든다. | Catalog/Lineage 확장 Phase |
| 실시간 데이터 AI Query 연결 | Kafka는 이번 주 보조 적재/처리량 증거로 제한한다. | 메인 JSON AI Query 성공 이후 |

## 6. 다음 작업자 실행 원칙

- 공통 계약 설계 전에는 MinIO bucket/path, sample file path, row 수를 임의로 확정하지 않는다.
- M6는 DuckDB를 직접 import하지 않고 `SqlEngineAdapter`를 통해 SQL 실행을 호출한다.
- 검증 질문은 Day 4 전까지 고정하지 않는다.
- Day 4에 검증 질문 3개를 확정한 뒤에는 6/29 Freeze 기준에 포함하고 임의 변경하지 않는다.
- Airflow 실패 시 같은 `WorkflowDefinition`을 local runner로 실행할 수 있게 유지한다.
- local runner fallback을 쓰더라도 `ExecutionResult` 형식은 Airflow 실행 결과와 동일하게 유지한다.
- `contracts/*.sample.json`이 실제 구현보다 먼저 소비 모듈 개발을 이어갈 수 있는 기준이 되어야 한다.
- Source of Truth 반영은 세부 계약이 확정된 뒤 `docs/00-layer-map.md`의 Change Propagation Rule에 따라 판단한다.

## 7. 관련 문서

프로젝트 문서 저장 위치:

- `docs/project-context/asklake-week2-module-plan/plan.md`
- `docs/project-context/asklake-week2-module-plan/decision-options.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/project-context/asklake-week2-module-plan/meeting-summary.md`
- `docs/project-context/asklake-week2-module-plan/meeting-decision-options.md`

회의용 원본 다운로드 문서:

- `/Users/tail1/Downloads/2주차 목표 설정 및 분업 계획/AskLake_미팅용_이번주_목표_6인_분업_요약.md`
- `/Users/tail1/Downloads/2주차 목표 설정 및 분업 계획/AskLake_미팅용_결정옵션_장단점_분석.md`

## Decision Option Briefs / 결정 옵션 브리프

- `decision-options.md`와 `meeting-decision-options.md`에 옵션 비교와 선택 이유를 기록했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 메인 데이터 | Amazon Reviews JSON | 메인 E2E와 AskLake 차별점이 가장 잘 드러남 | 사용자 미팅 결정 |
| 보조 데이터 | Taxi Batch + Kafka Event | 정형/실시간 확장성과 처리 규모 증거 확보 | 사용자 미팅 결정 |
| SQL Engine | Adapter 구조 + `DuckDBSqlEngine` | MVP 속도와 후속 교체 가능성을 함께 확보 | 사용자 미팅 결정 |
| Storage | MinIO | S3-compatible 흐름을 로컬에서 안정적으로 재현 | 사용자 미팅 결정 |
| Airflow | 실패 시 local runner 전환 | Airflow 목표를 유지하되 E2E 차단을 방지 | 사용자 미팅 결정 |
| Tenant/Auth | Demo Tenant 고정 + `tenant_id` 포함 | 구현 부담을 줄이고 B2B SaaS 확장 구조 유지 | 사용자 미팅 결정 |
| Workflow Node | Source, Select/Filter, Cast/Normalize, Aggregate, Load | 메인 E2E에 필요한 최소 DAG 표현 | 사용자 미팅 결정 |
| 품질 검사 | Schema 일치 + Row Count | Catalog, SQL 검산, 처리 증거에 직접 필요 | 사용자 미팅 결정 |
| 검증 질문 | Day 4에 통합 코드와 실제 데이터 기준으로 확정 | 질문을 미리 고정하지 않고 구현 결과에 맞춤 | 사용자 미팅 결정 |
| 데이터 범위 | Demo/fixed/extended sample 단계 | 작은 E2E부터 붙이고 규모 증거를 단계적으로 추가 | 사용자 미팅 결정 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| MinIO bucket/path 규칙 | 세부 계약 값은 공통 계약 설계가 필요함 | `contracts/*.sample.json` 작성 시작 | AskLake 공통 계약 설계 |
| sample 실제 파일 경로와 row 수 | 실제 데이터 위치와 처리 범위 확인 필요 | M3 JSON sample reader 구현 전 | AskLake 공통 계약 설계 |
| `SqlEngineAdapter` Python 위치 | 실제 backend 패키지 구조 확인 필요 | M6 구현 시작 전 | AskLake 공통 계약 설계 |
| local runner 전환 조건 | Airflow 실행 환경 확인 필요 | M5 Airflow adapter 구현 전 | AskLake 공통 계약 설계 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| MinIO | MinIO 실행이 E2E를 반복적으로 막음 | local path fallback 또는 AWS S3 선택 연결 검토 |
| DuckDB adapter | DuckDB가 검증 SQL을 처리하지 못함 | Adapter 유지 후 Trino/Athena 후보 재검토 |
| Day 4 질문 확정 | Day 4에 Schema/Catalog가 준비되지 않음 | 질문 수를 줄이거나 fallback Dataset 기준으로 확정 |
| Airflow fallback | Airflow 실행이 메인 E2E를 차단함 | 같은 `WorkflowDefinition`으로 local runner 전환 |
