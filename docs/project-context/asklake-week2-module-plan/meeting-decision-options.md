# AskLake 미팅용 결정 옵션 장단점 분석

- 목적: 팀원이 같은 기준으로 옵션을 비교하고, 회의 중 바로 결정한다.
- 기준 기간: 2026.06.25(목) ~ 2026.07.01(수)
- 전제: 이번 주 목표는 Amazon Reviews JSON 메인 End-to-End 완주이며, Taxi Batch와 Kafka Streaming은 보조 검증이다.

## 0. 결정 기준

이번 주 결정은 아래 기준으로 판단한다.

| 기준 | 설명 |
|---|---|
| E2E 성공 가능성 | 7/1 리뷰에서 처음부터 끝까지 실제로 보여줄 수 있는가 |
| 구현 난이도 | 팀이 이번 주 안에 이해하고 디버깅할 수 있는가 |
| 데모 안정성 | 외부 서비스, 인증, 환경 차이로 망가질 가능성이 낮은가 |
| 하네스 적합성 | Run ID, 계약 JSON, 증거, 검증 결과를 남기기 쉬운가 |
| 확장 가능성 | 이번 주 이후 Trino, Athena, AWS S3, 로그인 등으로 확장 가능한가 |

권장 흐름:

```text
빠른 결정
→ 계약 JSON 고정
→ 각 모듈 구현
→ 매일 E2E Smoke
→ 6/29 Freeze
```

## 1. 메인 데이터

결정할 것:

```text
이번 주 메인 End-to-End를 어떤 데이터로 보여줄 것인가?
```

| 선택지 | 장점 | 단점 | 판단 |
|---|---|---|---|
| A. Amazon Reviews JSON | JSON Schema Inference, Override, Catalog, RAG까지 AskLake 차별점이 잘 보인다. 메인 스토리와 가장 잘 맞는다. | 중첩 구조와 타입 충돌 때문에 M3가 막히면 전체가 흔들린다. | 추천 |
| B. PostgreSQL Taxi | 정형 데이터라 SQL 검산이 쉽고 안정적이다. Batch 성능 수치 만들기 좋다. | JSON/반정형 처리 차별점이 약하다. Metadata RAG 데모가 평범해질 수 있다. | 보조 검증 |
| C. Kafka Event | 실시간 처리와 처리량을 보여주기 좋다. | AI Query까지 연결하면 범위가 커진다. Kafka 환경 이슈가 생기면 데모 리스크가 크다. | 보조 검증 |
| D. 합성 통합 데이터 | 하나의 비즈니스 시나리오를 만들기 쉽다. | 데이터 생성/정합성에 시간이 든다. 실제 데이터 처리 설득력이 약해질 수 있다. | 이번 주 비추천 |

추천 결정:

```text
메인 데이터는 Amazon Reviews JSON으로 고정한다.
Taxi는 Batch 규모 증거, Kafka는 실시간 적재 증거로 분리한다.
```

결정:

```text
선택:
이유:
담당 모듈:
```

## 2. 보조 데이터

결정할 것:

```text
메인 E2E 외에 어떤 보조 흐름을 보여줄 것인가?
```

| 선택지 | 장점 | 단점 | 판단 |
|---|---|---|---|
| A. Taxi Batch + Kafka Event | 정형, 반정형, 실시간 3종 Source를 모두 보여준다. 플랫폼 확장성이 잘 보인다. | 팀원이 6명이어도 통합 부담이 있다. | 추천 |
| B. Taxi Batch만 | 구현 안정성이 높고 SQL 검산이 쉽다. | 실시간 데이터 메시지가 빠진다. | 일정이 매우 빡빡하면 선택 |
| C. Kafka Event만 | 실시간 처리량 데모가 강하다. | 정형 Batch 규모 증거가 빠진다. Kafka 리스크가 크다. | 비추천 |
| D. 보조 데이터 없음 | 메인 E2E에 모든 집중이 가능하다. | 플랫폼 확장성 설명이 약해진다. 6인 분업이 애매해진다. | 최후의 Cut |

추천 결정:

```text
보조 데이터는 Taxi Batch와 Kafka Event 둘 다 유지한다.
단, 둘 다 AI Query 연결은 필수로 하지 않는다.
```

결정:

```text
선택:
Taxi 필수 증거:
Kafka 필수 증거:
```

## 3. SQL Engine

결정할 것:

```text
AI Query에서 생성한 SQL을 어떤 엔진으로 실행할 것인가?
```

| 선택지 | 장점 | 단점 | 판단 |
|---|---|---|---|
| A. Adapter 구조 + DuckDB 구현체 | 이번 주에는 빠르게 DuckDB로 구현하고, 이후 Trino/Athena로 교체 가능하다. M6가 특정 엔진에 묶이지 않는다. | Adapter 계약을 최소한으로라도 먼저 정해야 한다. | 추천 |
| B. DuckDB 직접 사용 | 가장 빠르게 구현할 수 있다. 로컬 Parquet 검산에 좋다. | M6 코드가 DuckDB에 묶여 나중에 교체 비용이 생긴다. | 빠른 Spike에는 가능 |
| C. Trino | 데이터 레이크 query engine 느낌이 강하고 확장성 설명이 좋다. | catalog, connector, object storage 설정이 무겁다. 이번 주 디버깅 리스크가 크다. | Post-MVP 후보 |
| D. Athena | AWS S3와 잘 맞고 managed service라 운영 부담이 적다. | AWS, IAM, Glue/Athena 설정과 비용, 네트워크 의존성이 생긴다. | AWS 준비 완료 시 후보 |
| E. Spark SQL | Batch/Streaming과 같은 생태계로 묶기 좋다. | AI Query용 SQL Engine으로는 무겁고 팀 난이도가 높다. | 이번 주 비추천 |

추천 결정:

```text
SQL Engine은 Adapter 구조로 설계한다.
MVP 구현체는 DuckDBSqlEngine으로 한다.
M6는 DuckDB/Trino/Athena를 직접 import하지 않는다.
```

최소 계약:

```text
validate(sql, context) -> ValidationResult
execute(sql, context) -> QueryResult
explain_schema(dataset) -> DatasetSchema
health_check() -> EngineHealth
```

결정:

```text
Adapter 사용 여부:
MVP 구현체:
후속 후보:
SQL_ENGINE 값:
```

## 4. Storage

결정할 것:

```text
Parquet 결과를 어디에 저장하고, SQL Engine이 어떤 경로를 읽을 것인가?
```

| 선택지 | 장점 | 단점 | 판단 |
|---|---|---|---|
| A. local path 우선 + S3 URI 추상화 | 가장 안정적이고 빠르다. 데모 중 인증 문제가 적다. | 실제 S3 사용 느낌은 약하다. | 빠른 MVP에 좋음 |
| B. MinIO | S3-compatible 흐름을 로컬에서 재현할 수 있다. AWS 없이 S3 API 형태를 보여준다. | Docker/환경 설정이 필요하다. 팀원 PC 차이가 있을 수 있다. | 추천 |
| C. AWS S3 | 실제 클라우드 저장소를 보여줄 수 있다. | IAM, 비용, 네트워크, Region, credential 리스크가 있다. | 선택 |
| D. AWS S3만 사용 | 제품 메시지는 강하다. | 발표 당일 외부 환경 문제에 취약하다. | 이번 주 비추천 |

추천 결정:

```text
Storage는 S3-compatible 경로를 표준으로 둔다.
개발/데모 안정성은 local path 또는 MinIO로 확보하고, AWS S3는 선택 연결로 둔다.
```

결정:

```text
기본 저장 방식:
Fallback 저장 방식:
S3 URI 예시:
credential 관리 방식:
```

## 5. Airflow 실패 fallback

결정할 것:

```text
Airflow 실행이 막혔을 때 같은 Workflow를 어떻게 실행할 것인가?
```

| 선택지 | 장점 | 단점 | 판단 |
|---|---|---|---|
| A. Airflow만 사용 | 제품 방향과 잘 맞고 실제 오케스트레이션을 보여준다. | Airflow 환경 이슈가 생기면 전체 E2E가 막힌다. | 위험 |
| B. Airflow + local runner fallback | Airflow를 기본으로 유지하면서 데모 안정성을 확보한다. 같은 `WorkflowDefinition`을 재사용할 수 있다. | local runner 최소 구현이 필요하다. | 추천 |
| C. local runner만 사용 | 가장 단순하고 빠르다. | Airflow 연동을 보여주지 못한다. 문서 목표와 어긋날 수 있다. | 최후의 fallback |

추천 결정:

```text
기본은 Airflow 실행으로 한다.
단, Airflow가 막히면 같은 WorkflowDefinition을 local runner로 실행한다.
ExecutionResult 형식은 동일하게 유지한다.
```

결정:

```text
기본 실행 방식:
Fallback 조건:
Fallback 담당:
```

## 6. Tenant/Auth

결정할 것:

```text
이번 주에 로그인, Tenant, Role을 어디까지 구현할 것인가?
```

| 선택지 | 장점 | 단점 | 판단 |
|---|---|---|---|
| A. Demo Tenant 고정 + 모든 엔티티에 `tenant_id` 포함 | 구현이 빠르고 B2B SaaS 구조를 열어둔다. 데이터 모델 확장성이 있다. | 실제 로그인/권한 분리는 보여주지 못한다. | 추천 |
| B. 로그인만 구현 + Tenant 고정 | 데모 진입 화면이 자연스럽다. | 인증 구현과 세션 처리 시간이 든다. E2E와 직접 관련이 약하다. | 여유 시 선택 |
| C. 실제 Tenant + Role + RBAC | B2B SaaS 완성도가 높다. | 이번 주 범위가 크게 늘어난다. 핵심 E2E를 밀어낼 수 있다. | 비추천 |

추천 결정:

```text
로그인 없이 Demo Tenant를 고정한다.
단, Source, Pipeline, Run, Dataset, Query에는 `tenant_id`를 반드시 포함한다.
```

결정:

```text
Tenant 방식:
Role 표시 여부:
실제 로그인 여부:
```

## 7. Workflow Node

결정할 것:

```text
이번 주 No-code Workflow에서 어떤 Node만 지원할 것인가?
```

| 선택지 | 장점 | 단점 | 판단 |
|---|---|---|---|
| A. 5개 Node: Source, Select/Filter, Cast/Normalize, Aggregate, Load | 메인 E2E에 필요한 흐름을 충분히 표현한다. 구현 범위가 관리 가능하다. | Join, Quality Check 등 일부 기능은 제한된다. | 추천 |
| B. 3개 Node: Source, Transform, Load | 가장 단순하다. | 기능 설명이 추상적이고 No-code DAG 느낌이 약하다. | 일정 비상 시 |
| C. 8-9개 Node 전체 | 문서상 기능 목록과 잘 맞는다. | UI/실행/검증 부담이 크다. 이번 주 과범위다. | 비추천 |
| D. Node UI 없이 JSON만 | 실행 안정성이 높고 구현이 빠르다. | 데모에서 No-code 느낌이 약하다. | fallback |

추천 결정:

```text
지원 Node는 5개로 제한한다.
완성형 Drag-and-drop Canvas 대신 Form 또는 Node list 기반 UI로 간다.
```

결정:

```text
지원 Node:
UI 방식:
이번 주 제외 Node:
```

## 8. 품질 검사

결정할 것:

```text
이번 주 데이터 품질 검사를 어디까지 할 것인가?
```

| 선택지 | 장점 | 단점 | 판단 |
|---|---|---|---|
| A. Schema 일치 + Row Count | Catalog, SQL, 검산에 직접 필요하다. 구현이 단순하다. | 품질 엔진처럼 보이진 않는다. | 추천 |
| B. Schema + Row Count + Null/Freshness | 데모 설명력이 좋아진다. | M3/M5 작업이 늘어난다. | 여유 시 |
| C. Rule Engine | 제품 확장성은 좋다. | 이번 주 과범위다. | 비추천 |
| D. 품질 검사 없음 | 구현 부담이 줄어든다. | Catalog 신뢰성과 검증 스토리가 약해진다. | 비추천 |

추천 결정:

```text
이번 주 품질 검사는 Schema 일치와 Row Count만 필수로 한다.
Null/Freshness는 여유 시 화면에 표시한다.
```

결정:

```text
필수 품질 검사:
선택 품질 검사:
검증 담당:
```

## 9. 검증 질문

결정할 것:

```text
AI Query 검증 질문을 언제, 몇 개, 어떤 방식으로 고정할 것인가?
```

| 선택지 | 장점 | 단점 | 판단 |
|---|---|---|---|
| A. Day 1 오전에 3개 고정 | Schema, KPI, SQL, UI가 같은 목표로 움직인다. 정답 SQL 검산이 가능하다. | 질문 변경이 어려워진다. | 보류 |
| B. Day 4에 질문 결정 | 구현된 데이터에 맞춰 유연하게 정할 수 있다. | M6가 늦게 흔들리고 E2E 통합이 밀릴 수 있다. | 결정 |
| C. 질문 1개만 고정 | 빠르다. | 리뷰에서 AI Query 완성도가 약해 보일 수 있다. | 일정 비상 시 |
| D. 질문을 많이 준비 | 풍부해 보인다. | 검산 부담이 커지고 실패 가능성이 늘어난다. | 비추천 |

추천 결정:

```text
검증 질문은 Day 4에 통합된 코드와 실제 데이터 기준으로 3개를 확정한다.
Day 1에는 질문 후보를 고정하지 않고, M3/M5/M6가 실제 데이터 흐름을 먼저 붙인다.
질문 확정 후에는 예상 Dataset, 필요한 컬럼/KPI, 정답 SQL, 예상 결과를 함께 기록한다.
```

결정:

```text
질문 1: Day 4 확정
질문 2: Day 4 확정
질문 3: Day 4 확정
정답 SQL 담당:
```

## 10. 데이터 범위

결정할 것:

```text
이번 주 데모에 사용할 데이터 크기와 파일을 어디까지 고정할 것인가?
```

| 선택지 | 장점 | 단점 | 판단 |
|---|---|---|---|
| A. Demo sample + fixed sample + extended sample 단계 | 작은 데이터로 E2E를 먼저 붙이고, 이후 규모 증거를 추가할 수 있다. | 데이터 버전 관리가 필요하다. | 추천 |
| B. 전체 데이터 바로 사용 | 규모감이 강하다. | 처리 시간이 길고 실패 시 디버깅이 어렵다. | 비추천 |
| C. Tiny sample만 사용 | E2E가 빠르고 안정적이다. | 처리 규모와 실전성이 약하다. | 초기 개발용 |
| D. 모듈별 임의 데이터 | 각자 개발은 빠르다. | 통합 시 Schema와 질문이 어긋날 가능성이 크다. | 비추천 |

추천 결정:

```text
Demo sample + fixed sample + extended sample 단계만 확정한다.
실제 파일 경로와 row 수는 공통 계약 설계 때 확정한다.
E2E는 demo sample로 먼저 붙이고, 발표 수치는 fixed 또는 extended sample로 보강한다.
```

결정:

```text
Amazon Reviews category:
Demo sample rows: 공통 계약 설계 때 확정
Fixed sample rows: 공통 계약 설계 때 확정
Extended sample 여부: 공통 계약 설계 때 확정
파일 경로: 공통 계약 설계 때 확정
```

## 11. 회의 최종 결정 로그

| 항목 | 결정 | 이유 | 담당 | 영향 모듈 |
|---|---|---|---|---|
| 메인 데이터 | Amazon Reviews JSON | 메인 E2E와 AskLake 차별점이 가장 잘 드러남 | 이원재 | M3, M5, M6 |
| 보조 데이터 | Taxi Batch + Kafka Event | 정형/실시간 확장성과 처리 규모 증거 확보 | 염태선, 황선호 | M2, M4 |
| SQL Engine Adapter | Adapter 구조 + DuckDBSqlEngine | MVP 속도와 후속 교체 가능성을 함께 확보 | 유중일 | M6, M1 |
| Storage | MinIO | S3-compatible 흐름을 로컬에서 안정적으로 재현 | 이해건 | M2, M3, M4, M5 |
| Airflow fallback | Airflow 실패 시 local runner 전환 | Airflow 목표를 유지하되 E2E 차단을 방지 | 이해건 | M5 |
| Tenant/Auth | Demo Tenant 고정 + `tenant_id` 포함 | 구현 부담을 줄이고 B2B 확장 구조 유지 | 박태정 | M1 |
| Workflow Node | Source, Select/Filter, Cast/Normalize, Aggregate, Load | 메인 E2E에 필요한 최소 DAG 표현 | 이해건, 박태정 | M5, M1 |
| 품질 검사 | Schema 일치 + Row Count | Catalog, SQL 검산, 처리 증거에 직접 필요 | 이원재, 이해건 | M3, M5 |
| 검증 질문 | Day 4에 통합된 코드와 실제 데이터 기준으로 확정 | 질문을 미리 고정하지 않고 구현 결과에 맞춰 결정 | 유중일 | M3, M6 |
| 데이터 범위 | Demo sample + fixed sample + extended sample 단계 | 작은 E2E부터 붙이고 규모 증거를 단계적으로 추가 | 이원재 | M2, M3, M4 |

## 12. 오늘 결정 후 바로 해야 할 일

```text
1. contracts/*.sample.json 생성
2. Amazon Reviews demo/fixed/extended sample 단계만 합의하고 세부 경로/row 수는 공통 계약 설계 때 확정
3. 검증 질문은 Day 4에 통합된 코드와 실제 데이터 기준으로 확정
4. SQL_ENGINE=duckdb 기준 Adapter skeleton 작성
5. MinIO bucket/path 규칙은 공통 계약 설계 때 확정
6. WorkflowDefinition v1 작성
7. 공통 계약 Fixture는 Day 1에 만들고, 모듈별 세부 산출물은 다음날 통합된 코드 상태를 보고 유연하게 확정
```
