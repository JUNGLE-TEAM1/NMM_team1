# 02. 아키텍처

## 1) 기술 선택 근거

| 영역 | 선택 | 이유 |
| --- | --- | --- |
| Runtime | FastAPI candidate | XFlow의 API-first 구조를 참고하되 MVP는 local backend로 축소한다. |
| UI | React + Vite candidate | XFlow의 웹 UI 흐름을 참고해 빠른 데모 UI를 만든다. |
| Data | SQLite metadata store + replaceable `MetadataStore` boundary | MVP는 container-first로 재현 가능한 저장소를 우선하되, PostgreSQL/MongoDB로 교체 가능한 경계를 둔다. |
| Infra | CI/CD + Docker + Kubernetes + AWS foundation | 제품 기능 개발 전에 배포 가능한 기본 골격을 먼저 만든다. |

## 2) 시스템 구성

### Infrastructure-first MVP 구성

```text
GitHub Actions CI/CD
  -> Docker images
  -> Kubernetes manifests or Helm candidate
  -> AWS environment and secrets strategy
  -> React UI
  -> FastAPI backend
  -> metadata store
  -> pipeline runner
  -> source/output storage
```

### 단계별 아키텍처 진화

| 단계 | 목표 구조 | 주 저장소/실행 | 승인 gate |
| --- | --- | --- | --- |
| Infra foundation | 앱 코드 전 CI/CD, Docker, Kubernetes, AWS 전략을 확정 | GitHub Actions, Dockerfile, K8s manifest/Helm 후보, AWS IAM/secret/env 설계 | 실제 AWS resource 생성 승인 필요 |
| AWS bootstrap readiness | 승인 직후 실행 가능한 AWS 연결 준비 | GitHub OIDC, ECR repository plan, EKS-ready bootstrap script, manual deploy workflow | 비용/IAM/resource 생성 전 approval checklist 필요 |
| Container-first local | 모든 개발자가 같은 container 명령으로 실행 | Docker Compose 또는 local Kubernetes 후보, container volume output | DB와 secret 주입 방식 확인 |
| AWS deployable MVP | MVP 기능을 배포 가능한 형태로 유지 | ECR/EKS 또는 대체 AWS compute 후보, managed DB/storage 후보 | 비용/운영/rollback 승인 필요 |
| Optional distributed | 병목이 확인된 뒤 일부 컴포넌트만 분리 | S3, Spark, Airflow, Trino, OpenSearch 후보 | 추가 비용/운영 승인 필요 |

AskLake는 개발 시작 전에 배포 가능한 골격을 만든다. 단, 실제 AWS 비용이 발생하는 resource 생성은 승인 gate를 통과해야 하며, local/container smoke 경로는 항상 유지한다.

## 3) 계층 구조

### 제품 소스

- 책임: 실제 제품 기능을 구현한다.
- 주요 파일/모듈: `frontend/`, `backend/`, local runner 모듈.
- 경계: 하네스 문서와 운영 스크립트는 제품 런타임 코드와 분리한다.

### Backend Layering

M3 이후 backend는 교체 가능한 port/adapter 구조를 따른다.

```text
backend/app/
  api/       HTTP router와 HTTP error mapping
  services/  use case orchestration
  ports/     MetadataStore, SourceConnector, ResultStore 같은 Protocol/interface
  adapters/  SQLite, CSV, future Postgres/Mongo/S3 구현체
  domain/    API/domain schema와 value object
  core/      settings, dependency container, app factory
```

의존 방향:

```text
api -> services -> ports/domain
adapters -> ports/domain
core -> api/services/adapters
```

API router는 SQLite, CSV, future PostgreSQL/MongoDB/S3/Spark 같은 concrete implementation에 직접 의존하지 않는다. concrete implementation 선택은 `core/container.py`에서 한다.

### Frontend Layering

M3 이후 frontend는 app shell, API client, feature UI를 나눈다.

```text
frontend/src/
  api/               resource별 backend client와 shared http client
  app/               app shell and global styles
  components/        shared UI components
  features/catalog/  source form, catalog list/detail, catalog state hook
  features/pipeline/ pipeline run panel and run state hook
```

feature component는 backend endpoint 문자열을 직접 조립하지 않고 `api/asklakeClient.js`를 통해 호출한다.
`asklakeClient.js`는 legacy re-export entrypoint로 유지하고, 신규 코드는 `sourceApi`, `catalogApi`, `pipelineApi` 같은 resource별 client를 우선 사용한다.
화면 component는 가능한 한 form/list/panel 렌더링에 집중하고, fetch/selection/run orchestration은 feature hook에 둔다.

### Metadata Store 경계

- M3의 기본 구현은 SQLite를 사용한다.
- API router는 DB에 직접 접근하지 않고 service와 `MetadataStore` 경계를 통해 source/catalog metadata를 읽고 쓴다.
- ID는 SQLite integer primary key에 묶이지 않도록 string UUID를 사용한다.
- schema, sample, connection config, catalog properties는 JSON 친화적인 구조로 저장한다.
- PostgreSQL 또는 MongoDB 전환은 `PostgresMetadataStore` 또는 `MongoMetadataStore` 구현체 추가로 처리하고, API response contract는 유지한다.
- XFlow 참고: XFlow backend의 catalog/app metadata는 MongoDB/Beanie document model에 가깝지만, AskLake MVP는 MongoDB를 필수 인프라로 끌어오지 않고 경량 SQLite로 시작한다.

### M4 실행 경계

- `SourceConnector`: CSV/local file, future PostgreSQL/MySQL/MongoDB/S3 source inspection을 교체한다.
- `PipelineService`: 현재 MVP pipeline run을 동기 실행한다. source connector, transform, result store, metadata store를 조합한다.
- `PipelineRunner`: future background worker, Spark, Airflow runner 후보 경계다. 현재 MVP runtime에는 아직 주입하지 않는다.
- `ResultStore`: local file/container volume, SQLite/PostgreSQL table, future S3 result storage를 교체한다.
- M4에서는 `CsvSourceConnector`, `PipelineService`, local CSV `ResultStore`를 붙였다. 비동기/job runner는 M8 이후 확장 후보로 둔다.

### 협업 하네스

- 책임: 요구사항, Phase, 검증, PR 준비 상태를 기록한다.
- 주요 파일/모듈: `AGENTS.md`, `docs/`, `scripts/`, `.github/`
- 경계: 제품 요구사항과 구현 결과를 기록하지만 제품 런타임 로직을 대신하지 않는다.

## 4) 데이터 모델

### 제품 엔티티

| 항목 | 타입 | 설명 |
| --- | --- | --- |
| `Connection` | object | 데이터 소스 이름, type, connection config 또는 file reference |
| `Pipeline` | object | source, transforms, target, schedule placeholder |
| `PipelineRun` | object | run id, pipeline id, status, started/finished time, logs/error |
| `CatalogDataset` | object | 결과 데이터 이름, schema, row count, sample/location |
| `MetadataStore` | interface | source, catalog dataset, pipeline, run metadata를 저장/조회하는 backend 내부 경계 |
| `SourceConnector` | interface | source type별 schema/sample inspection을 수행하는 backend 내부 경계 |
| `PipelineService` | service | MVP pipeline run을 동기 실행하고 source/transform/result/catalog 경계를 조합 |
| `PipelineRunner` | future interface | pipeline 실행 방식을 background worker, Spark, Airflow 등으로 교체하기 위한 후보 경계 |
| `ResultStore` | interface | pipeline 결과 저장 위치를 local file, DB table, S3 등으로 교체하기 위한 경계 |
| `DeploymentEnvironment` | object | local, dev, staging 후보 환경 이름과 endpoint, secret reference |
| `BuildArtifact` | object | image tag, commit sha, build status, scan/test result |

## 5) 핵심 흐름

### 흐름 A. Phase 기반 개발

```text
1. Human/AI -> Source of Truth: 요구사항과 범위 기록
2. Human/AI -> branch workspace: 계획, sync, quality, decision 기록
3. AI/Human -> product source: 구현
4. Human/AI -> checks: 테스트/검증 실행
5. Human/AI -> PR: linked issue와 closing keyword 확인
```

### 흐름 B. MVP 파이프라인 실행

```text
1. User -> UI: 데이터 소스 등록
2. UI -> API: connection 또는 file metadata 저장
3. User -> UI: source, transform, target 정의
4. UI -> API: pipeline 저장
5. User -> API: pipeline run 요청
6. API -> PipelineService: local transform 실행
7. PipelineService -> storage: 결과 데이터 저장
8. API -> catalog: schema/row count/sample 기록
9. UI -> User: run status와 catalog result 표시
```

## 6) 외부 연동

| 연동 | 목적 | 실패 대응 |
| --- | --- | --- |
| GitHub Issues / PRs | 작업 추적과 merge 후 issue close | PR 템플릿과 `sync.md`에서 closing keyword 확인 |
| GitHub Project / Notion sync | 보드 상태 동기화 | `.github/workflows/notion-issue-sync.yml` 결과와 secrets 설정 확인 |
| XFlow local reference | MVP 범위와 사용자 흐름 참고 | 코드를 복사하지 않고 docs 근거로만 사용 |
| GitHub Actions | CI/CD 실행 | 실패 job log를 확인하고 배포를 중단 |
| Docker registry / AWS ECR 후보 | image 저장 | image tag/rollback tag 기록, ECR repository는 승인 후 bootstrap |
| Kubernetes / AWS EKS 후보 | 배포 runtime | smoke 실패 시 rollout 중단 또는 rollback, EKS cluster는 승인 후 bootstrap |

## 7) 장기 컴포넌트 후보

| 컴포넌트 | Local-first | Single-node | Optional distributed/cloud |
| --- | --- | --- | --- |
| Source connector | CSV/local file | PostgreSQL/MySQL/MongoDB/REST API 후보 | S3, managed DB, CDC source |
| Pipeline runner | FastAPI 내부 또는 local worker | background worker, retry/log 저장 | Spark, Airflow DAG |
| Metadata store | SQLite + `MetadataStore` interface | PostgreSQL 또는 MongoDB implementation | managed DB/document store |
| Result storage | local file 또는 container volume | SQLite/PostgreSQL table 후보 | S3/data lake |
| Catalog/search | SQLite query와 basic list/detail | indexed metadata table, PostgreSQL/MongoDB search | OpenSearch/Nori |
| Query | DuckDB local query | DuckDB + saved history | Trino |
| AI assistant | rule/mock 기반 도움말 | schema-aware prompt builder | 승인된 외부 LLM/Bedrock |
| Observability | backend/run logs | structured logs, health/smoke | metrics, dashboards, alerting |

## 8) 인프라 선행 기준

| 영역 | 개발 전 최소 기준 | 완료 증거 |
| --- | --- | --- |
| CI | lint/test/build/harness validation workflow 초안 | GitHub Actions workflow 파일과 local 검증 명령 |
| CD | image build, tag, deploy dry-run 또는 manifest validation | image tag 규칙, 배포 gate, rollback note |
| Docker | frontend/backend Dockerfile 또는 단일 MVP image 전략 | `docker build`와 local run command |
| Kubernetes | namespace, deployment, service, config/secret 주입 방식 초안 | manifest/Helm 후보와 smoke path |
| AWS | 계정/region/IAM/ECR/EKS 또는 대체 compute/storage 전략 | OIDC/ECR/EKS bootstrap readiness와 비용 발생 resource 생성 전 approval checklist |
| Secrets | `.env.example`, GitHub Secrets, AWS secret 주입 원칙 | 실제 secret 미포함 확인 |

## 9) 운영과 배포

### 환경

- Local: first supported environment for MVP demo
- Staging: deferred
- Production: deferred

### 환경 변수와 secret

| 이름 | 필수 여부 | 설명 |
| --- | --- | --- |
| `NOTION_TOKEN` | Yes, if Notion sync is active | GitHub Actions secret |
| `NOTION_DATABASE_ID` | Yes, if Notion sync is active | GitHub Actions secret |
| `ISSUE_SYNC_PAT` | Optional | GitHub Project 권한이 기본 token으로 부족할 때 사용 |
| `AWS_REGION` | Yes, for AWS deploy | AWS CLI, ECR, EKS target region |
| `AWS_ACCOUNT_ID` | Yes, for AWS deploy | ECR registry와 IAM role ARN 확인 |
| `AWS_ROLE_TO_ASSUME` | Yes, for GitHub AWS deploy | GitHub Actions OIDC assume role ARN |
| `ECR_REPOSITORY_PREFIX` | Yes, for AWS deploy | AskLake backend/frontend ECR repository prefix |
| `EKS_CLUSTER_NAME` | Yes, for EKS deploy | dev EKS cluster name |
| `K8S_NAMESPACE` | Yes, for Kubernetes deploy | Kubernetes namespace |
| `ASKLAKE_METADATA_URL` | Optional for M3 | 기본값은 local SQLite file. PostgreSQL/MongoDB 전환 시 store implementation별 URL로 확장 |

### 상태 확인

- Backend health endpoint responds.
- Frontend loads the MVP golden path page.
- A sample pipeline run reaches success or a clear failed state.

### 마이그레이션과 롤백

- Migration command: M3에서는 SQLite init/migration command를 정의한다. PostgreSQL 또는 MongoDB 전환 시 별도 migration/import command를 추가한다.
- Rollback limitation: MVP local output can be regenerated from sample source when pipeline config remains.
- Data backup note: no production data in MVP unless explicitly approved.

### 로그와 모니터링

- Logs: backend request logs and pipeline run logs.
- Metrics: deferred.
- Alerts: deferred.
