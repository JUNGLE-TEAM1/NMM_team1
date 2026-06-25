# 01. 제품 기획

## 1) 한 줄 설명

AskLake는 여러 데이터 소스를 연결해 검증된 데이터셋으로 게시하고, 권한 안에서 SQL과 자연어 질문으로 활용하며, 답변과 분석 결과의 근거를 리니지·품질·정책·감사 기록으로 확인하게 하는 B2B SaaS Trusted Data & AI Platform이다.

## 2) 제품 문제 정의

### 핵심 문제

- 기업 데이터는 RDB, API, 파일, 오브젝트 스토리지, 문서, 이벤트 등 여러 위치에 흩어져 있다.
- 데이터 파이프라인, 카탈로그, 품질, 권한, 쿼리, RAG가 서로 다른 상태 모델을 쓰면 결과가 그럴듯해도 재현과 검증이 어렵다.
- SQL에서는 차단된 데이터가 AI 답변에는 노출되거나, 파이프라인은 성공했지만 품질 정책 때문에 게시하면 안 되는 데이터가 소비될 수 있다.

AskLake의 핵심 가설은 데이터 수집부터 Query/Ask 답변, 장애 복구까지 같은 메타데이터, 정책, 리니지, 감사 모델을 공유하면 작은 팀도 “왜 이 결과를 믿을 수 있는가”를 설명할 수 있다는 것이다.

### Current Implementation Baseline

현재 코드와 evidence의 기준점은 기존 M0~M5에서 완료된 경량 데이터 파이프라인 baseline이다.
이 baseline은 Target MVP의 제품 목표가 아니라, 현재 동작하는 출발점이다.

- CSV/local file source 등록
- SQLite-backed `MetadataStore`
- source/catalog list/detail API
- `select_fields` 기반 최소 pipeline run
- local CSV `ResultStore`
- frontend에서 source, catalog, pipeline run, result dataset 확인
- Docker Compose와 container smoke 기반 검증

### Target MVP 핵심 문제

Target MVP는 `Trusted Dataset -> Query/Ask -> Evidence -> Recovery` 신뢰 루프를 증명한다.

하나의 데이터셋을 단순히 만들고 조회하는 것이 아니라:

1. source를 연결하고 schema와 sample을 확인한다.
2. catalog draft와 품질/PII/소유자/정책 정보를 연결한다.
3. 필수 gate를 통과한 데이터셋만 `Trusted`로 게시한다.
4. Query 또는 Ask에서 권한 preflight와 정책을 적용한다.
5. 답변 또는 분석 결과에 SQL, 데이터셋, 지표, 문서, freshness, lineage, policy decision evidence를 연결한다.
6. schema drift나 품질 실패가 발생하면 영향 자산을 확인하고 retry/rerun/backfill로 복구한다.

## 3) 대상 사용자

- 데이터 엔지니어: source onboarding, pipeline, run, retry/backfill, 장애 복구를 담당한다.
- 데이터 스튜어드: 품질 규칙, PII 후보, 소유자, 접근 정책, 승인 결정을 검토한다.
- 데이터 분석가: Catalog에서 신뢰 가능한 데이터셋을 찾고 Query Studio와 간단한 Dashboard로 공유한다.
- 업무 사용자: Ask Workspace에서 자연어로 질문하고 Evidence Panel로 근거를 확인한다.
- AI 운영자: RAG/NL2SQL 평가셋, index 상태, retrieval trace, 실패 질문을 관리한다.
- 플랫폼/보안 관리자: 배포, secret, 역할, 정책, audit event, 접근 요청, 이상 접근을 관리한다.

## 4) 제품 목표

- AskLake가 소유하는 Control Plane으로 데이터셋 상태, 정책, 품질, 리니지, AI evidence를 통합한다.
- 현재 구현 baseline을 보존하면서 Target MVP 신뢰 루프로 확장한다.
- 모든 Phase는 Source of Truth, branch workspace, quality evidence, report를 남긴다.
- 고비용/고복잡도 인프라는 approval gate와 Decision Option Brief 뒤에 도입한다.

## 5) Target MVP 범위

### 핵심 기능

- Source onboarding: 최소 1개 current baseline source와, 다음 확장 source 후보를 연결 검증 가능하게 한다.
- Catalog draft: source 또는 pipeline output에서 dataset draft를 만들고 schema, owner, freshness, lineage seed를 연결한다.
- Trust Gate: 품질, PII, 소유자, 접근 정책, 승인 조건을 통과해야 `Trusted`로 게시한다.
- Dataset 상태: `Draft`, `Verifying`, `Trusted`, `Degraded`, `Blocked`, `Archived`를 구분한다.
- Query path: 게시된 데이터셋을 권한 preflight 뒤 Query 또는 SQL draft로 사용한다.
- Ask path: 질문을 SQL, RAG, Hybrid, Unsupported로 라우팅하고 근거 부족 또는 권한 위반은 보류한다.
- Evidence: SQL, dataset, metric, document chunk, freshness, lineage, policy decision, retrieval trace를 결과와 연결한다.
- Recovery: schema drift, 품질 실패, freshness 지연을 영향 자산과 함께 보여주고 retry/rerun/backfill 결과를 기록한다.

### Target Architecture 후보

- Experience Plane: Build, Trust, Analyze, Ask, Operate, Admin
- Control Plane: API Gateway/BFF, Catalog/Metadata, Lightweight Orchestrator, Policy/Approval/Audit, Quality/PII/Lineage, AI Router/RAG Control
- Data Plane: source connector, pipeline task, object storage, query engine, serving/cache
- State Plane: metadata DB, job/event state, audit event, retrieval trace, vector index, secrets/config
- Deployment: B2B SaaS 제품 방향은 유지하되 Target MVP는 local/container path로 검증하고, Kubernetes/Helm은 dev-lite packaging 후보로 관리하며 실제 cloud resource는 approval gate 뒤에 진행

### 제외 또는 Decision 이후 범위

- 모든 source connector 동시 지원
- production-grade streaming/CDC와 Flink
- 범용 Airflow 호환과 모든 operator 지원
- 모든 행 데이터의 vectorization
- production-grade multi-tenant SaaS 운영
- 행 단위 접근 정책
- 완전한 BI 저작 도구
- 실제 AWS/EKS/S3/RDS/Bedrock/OpenSearch resource 생성

## 6) Current Baseline과 Target MVP 관계

| 구분 | 역할 | 상태 |
| --- | --- | --- |
| Current implementation baseline | 현재 코드가 실제 제공하는 기능과 검증 증거 | M0~M5 완료 |
| Product direction | AskLake가 지향하는 제품 정체성 | Trusted Data & AI Platform으로 재기준화 |
| Target MVP | 다음에 증명할 신뢰 루프 | `Trusted Dataset -> Query/Ask -> Evidence -> Recovery` |
| Historical evidence | 과거 Phase report와 검증 결과 | 수정하지 않고 보존 |

Current baseline은 Target MVP의 첫 단계에 재사용할 수 있지만, 제품 목표를 제한하지 않는다.

## 7) 주요 사용자 흐름

### 흐름 A. Current Baseline 확인

1. 사용자가 샘플 CSV source를 등록한다.
2. Catalog detail에서 schema, row count, sample rows를 확인한다.
3. 사용자가 `select_fields` 기반 pipeline run을 실행한다.
4. result dataset의 status, row count, 저장 위치를 확인한다.

### 흐름 B. Target MVP 신뢰 루프

1. 데이터 엔지니어가 source를 연결하고 schema discovery를 확인한다.
2. 시스템이 catalog draft와 pipeline/task definition을 만든다.
3. 스튜어드가 품질, PII, owner, 접근 정책, approval diff를 검토한다.
4. 필수 gate를 통과한 dataset만 `Trusted`로 게시된다.
5. 분석가 또는 업무 사용자가 Query/Ask를 실행한다.
6. 시스템은 권한 preflight, masking, policy decision을 적용한다.
7. 결과는 Evidence Panel에서 SQL, dataset, metric, document, lineage, freshness, retrieval trace를 보여준다.
8. schema drift나 품질 실패가 생기면 dataset이 `Degraded` 또는 `Blocked`가 되고, 영향 자산과 복구 행동이 표시된다.
9. retry/rerun/backfill이 성공하면 freshness와 trust 상태가 복구되고 audit event가 남는다.

## 8) 마일스톤

### 완료된 baseline

| 마일스톤 | 결과 | 현재 역할 |
| --- | --- | --- |
| M0. MVP 범위 확정 | XFlow 참고 범위와 경량 MVP 문서화 | historical evidence |
| M1. 인프라 부트스트랩 | CI/CD, Docker, Kubernetes, AWS approval gate foundation | reusable foundation |
| M2. 앱 골격과 컨테이너 | FastAPI/React skeleton, health, compose smoke | current app shell |
| M3. 소스와 카탈로그 | CSV/local source와 SQLite catalog | baseline source/catalog |
| M4. 최소 파이프라인 실행 | `select_fields` pipeline run과 local result store | baseline execution |
| M5. 데모 정리 | Docker Compose 기반 baseline demo | baseline manual path |

### Target MVP Rebaseline 이후 실행 구조

R0 이후 Target MVP는 선형 R1~R7 순서표가 아니라 R0.5 `Modular Contract Baseline`을 거친 뒤 병렬 workstream과 integration spine으로 실행한다.
기존 R1~R7 이름은 historical planning alias로 보존한다.

| Alias | Workstream / Phase 후보 | 목표 | 포함 범위 | 제외 범위 | 완료 기준 |
| --- | --- | --- | --- | --- |
| R0. Product Rebaseline | docs/product-rebaseline-trusted-platform | 제품 기준과 Target MVP를 Source of Truth에 반영 | current baseline/target 분리, architecture/interface/acceptance 재정렬 | 코드 구현 | 문서 검증 통과, 다음 구현 Phase 하나 확정 |
| R0.5. Modular Contract Baseline | docs/modular-contract-baseline | 병렬 workstream 실행을 위한 shared contract와 integration spine 확정 | module ownership, mock/fake boundary, `.milestones/target-mvp/manifest.yaml` | runtime code 구현 | strict validation 통과, 첫 병렬 wave 후보 확정 |
| R1. Trust State Model / Publish Gate | Catalog / Trust | dataset 상태와 게시 gate를 만든다 | `Draft/Verifying/Trusted/Degraded/Blocked`, quality/PII/policy placeholder | 실제 고급 PII 탐지, 모든 source 확장 | trusted/blocked 상태 전이가 API/UI에서 확인됨 |
| R2. Control Plane Job State | Job / Orchestrator | pipeline version, job/task, audit event 기초를 만든다 | job state, event/outbox, retry/rerun 기록 | 범용 scheduler | run/task 상태와 audit evidence 기록 |
| R3. Source 확장 | Source Connector | baseline 외 source 하나를 선택해 연결한다 | PostgreSQL 또는 REST API 중 하나 | 모든 source 동시 지원 | 연결 성공/실패와 schema discovery 확인 |
| R4. Query와 권한 Preflight | Query / Policy | Trusted dataset을 정책 안에서 query한다 | query service, policy preflight, masking 후보 | Trino 필수화 여부는 Decision 뒤 | 허용/차단/마스킹 케이스 검증 |
| R5. Ask와 Evidence | Ask / Evidence | Ask 결과에 근거와 보류 사유를 연결한다 | AI Router, RAG/NL2SQL control, Evidence Panel 초안 | 외부 LLM 강제, 대규모 vectorization | 근거 있음/부족/권한 거부 케이스 검증 |
| R6. Operate와 Recovery | Recovery / Operate | 장애 영향과 backfill 복구를 보여준다 | schema drift, freshness, degraded/blocked, retry/backfill | production incident system | 복구 후 중복/누락 없이 trust 상태 정상화 |
| R7. Packaging 안정화 | Packaging | local/container 또는 dev-lite packaging 프로파일을 정리한다 | Helm/dev-lite 후보, health check, secret/config 검증 | cloud resource 자동 생성 | local/container smoke와 manifest 검증 통과 |

## 9) 성공 기준

- Target MVP 데모에서 하나의 데이터셋이 `Trusted`로 게시되는 이유와 남은 gate를 설명할 수 있다.
- Query 또는 Ask 결과가 evidence 없이 성공처럼 표시되지 않는다.
- 권한 없는 데이터는 SQL, RAG retrieval, prompt, final answer 어느 단계에도 들어가지 않는다.
- 장애나 품질 실패가 downstream dataset/query/answer/dashboard 상태에 반영된다.
- retry/rerun/backfill은 중복 또는 잘못된 trusted 상태를 만들지 않는다.
- current baseline과 target scope가 문서에서 혼동되지 않는다.

## 10) 결정 사항과 열린 질문

### 확정

- 기존 CSV/local pipeline MVP는 앞으로의 제품 목표가 아니라 `Current implementation baseline`으로 남긴다.
- `reference/AskLake_프로젝트_기획서.md`를 AskLake의 새 제품 기준으로 올린다.
- 다음 Target MVP는 `Trusted Dataset -> Query/Ask -> Evidence -> Recovery` 신뢰 루프를 증명하는 방향으로 잡는다.
- 기존 M0~M5 report는 historical evidence로 유지하고 새 기준에 맞춰 소급 수정하지 않는다.
- 실제 AWS 비용이 발생하는 resource 생성은 승인 gate 뒤에 실행한다.
- 라이선스는 아직 TBD이며 사람 확인 없이 라이선스 조항을 추가하거나 바꾸지 않는다.

### 열림

- R1에서 quality/PII/policy를 실제 엔진으로 구현할지, 먼저 상태 모델과 placeholder gate로 시작할지 결정해야 한다.
- R3의 첫 확장 source를 PostgreSQL로 할지 REST API로 할지 결정해야 한다.
- R4에서 local DuckDB 경로를 먼저 쓸지 Trino를 포함할지 결정해야 한다.
- R5에서 외부 LLM을 사용할지 mock/local rule 기반으로 시작할지 결정해야 한다.
- Kubernetes/Helm은 Target Packaging 후보로 유지하되, 실제 cloud deploy와 상용 SaaS 운영 시점은 별도 승인과 비용 검토가 필요하다.
