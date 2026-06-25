# AskLake 프로젝트 지금까지의 흐름

이 문서는 새 팀원이 AskLake 프로젝트가 어디서 시작했고, 지금 어디까지 와 있으며, 다음 개발을 어떻게 시작하면 되는지 빠르게 이해할 수 있도록 정리한 온보딩용 요약이다. 이 문서는 새로운 요구사항을 정하는 문서가 아니다. 실제 기준은 `README.md`, `docs/01-product-planning.md`, `docs/02-architecture.md`, `docs/03-interface-reference.md`, `docs/08-development-workflow.md` 같은 Source of Truth 문서에 있고, 이 문서는 그 흐름을 사람이 읽기 쉽게 풀어쓴 안내문이다.

## AskLake가 만들려는 것

AskLake는 여러 곳에 흩어진 데이터를 한곳에서 다루게 해주는 B2B SaaS Trusted Data & AI Platform을 목표로 한다. 하지만 단순히 데이터를 모으는 도구에 머무르지 않는다. 이 프로젝트가 정말 보여주려는 것은 “대용량/복합 데이터셋을 어떻게 수집·스키마화·변환·검산·게시했고, 이 데이터와 이 답변을 왜 믿을 수 있는가”다. 기업 안의 데이터는 파일, 데이터베이스, 외부 API, 문서처럼 여러 형태로 나뉘어 있고, 크기와 구조도 제각각이다. 데이터가 언제 들어왔는지, 어떤 스키마로 해석됐는지, 어떤 변환과 정규화를 거쳤는지, 어떤 검사를 통과했는지, 누가 볼 수 있는지, 나중에 어떤 답변이나 분석에 쓰였는지를 따라가기 어렵다. AskLake는 이 흐름을 한 제품 안에서 이어 보이게 하려는 프로젝트다.

현재 제품 방향은 대용량/복합 데이터셋을 신뢰 가능한 분석 자산으로 만드는 `Trusted Dataset -> Query/Ask -> Evidence -> Recovery` 흐름으로 정리되어 있다. 쉬운 말로 풀면, 먼저 하나의 대표 데이터셋을 source onboarding, schema inference, 사용자 보정, transform/normalize/load, Parquet 또는 S3-compatible 저장, SQL 검산, 품질/PII/권한 검토를 거쳐 믿을 수 있는 데이터셋으로 만들고, 그 처리 과정의 row count, bytes, duration, output path를 증거로 남긴다. 그 다음 SQL이나 자연어 질문을 실행하고, 결과가 어떤 근거에서 나왔는지 보여주며, 문제가 생겼을 때 어디에 영향을 줬고 어떻게 복구했는지 확인하게 한다. 여기서 `Trusted Dataset`은 검사를 통과해 믿고 쓸 수 있다고 표시된 데이터셋이고, `Query/Ask`는 SQL 질의나 자연어 질문을 뜻한다. `Evidence`는 답변의 근거와 처리 증거이며, `Recovery`는 데이터가 깨지거나 오래되었을 때 다시 정상 상태로 돌리는 과정이다.

Target MVP는 상용 멀티테넌트 SaaS 운영 전체를 지금 완성한다는 뜻이 아니다. 실행 환경은 `local/container` 기반의 단일 Demo Tenant가 우선이고, 그 안에서 B2B SaaS로 확장될 핵심 구조를 검증한다. 따라서 로컬에서 실행한다고 해서 self-hosted 제품으로 방향이 바뀌는 것은 아니며, Demo Tenant와 `tenant_id`는 SaaS 확장 구조를 열어두기 위한 MVP 장치다.

## 처음 출발점

처음 프로젝트는 큰 데이터 플랫폼 전체를 바로 만들기보다, 작은 데이터 파이프라인 데모를 먼저 완성하는 방향으로 출발했다. XFlow를 참고하되 그대로 따라 만들지는 않았고, 팀 프로젝트 규모에서 보여줄 수 있는 최소 흐름을 잡았다. 이 흐름은 샘플 CSV 파일을 등록하고, 카탈로그에서 스키마와 샘플을 확인하고, 필요한 컬럼만 고르는 간단한 파이프라인을 실행한 뒤, 결과 데이터셋을 다시 확인하는 방식이었다.

이 초기 흐름은 M0부터 M5까지의 단계에서 현재 개발 완료 상태로 남아 있다. 지금 코드에는 FastAPI 백엔드와 React 프론트엔드 골격이 있고, Docker Compose로 로컬에서 실행할 수 있다. 백엔드는 SQLite 기반 메타데이터 저장소를 사용하고, 샘플 CSV 파일을 source로 등록할 수 있으며, catalog list/detail, `select_fields` 중심의 작은 파이프라인 실행, local CSV 결과 저장, result dataset 확인을 지원한다. 이 부분은 앞으로 만들 최종 제품 전체가 아니라, 현재 실제로 동작하는 출발점이다. 그래서 문서에서는 이 상태를 Current Implementation Baseline이라고 부른다.

이 baseline을 보존하는 이유는 중요하다. 이미 검증된 작은 동작을 지우거나 과장하지 않고, 앞으로의 큰 제품 목표와 구분하기 위해서다. 현재 동작하는 것은 현재 동작한다고 말하고, 아직 목표로만 잡힌 것은 목표라고 말해야 팀이 혼동하지 않는다.

## 제품 기준을 다시 잡은 이유

초기 데모를 만든 뒤, 프로젝트는 단순한 파이프라인 데모에서 Trusted Data & AI Platform 방향으로 제품 기준을 다시 잡았다. 원문 기획서에는 AskLake가 데이터 수집, 품질, 권한, 리니지, 감사 기록, SQL 분석, 자연어 질문, 장애 복구까지 이어지는 더 큰 제품으로 설명되어 있었다. 이 방향은 프로젝트의 장기 목표와 잘 맞았지만, 그대로 현재 MVP에 덮어쓰면 범위가 너무 커지고 기존에 완료된 작은 baseline과 충돌할 위험이 있었다.

그래서 Product Rebaseline을 했다. 이 작업의 핵심은 현재 구현 baseline과 앞으로 만들 Target MVP를 분리하는 것이었다. 현재 baseline은 이미 작동하는 CSV/local pipeline demo로 남기고, 새 Target MVP는 대용량/복합 데이터셋 조작 증거를 포함한 `Trusted Dataset -> Query/Ask -> Evidence -> Recovery` 신뢰 흐름을 증명하는 방향으로 정리했다. 과거 M0부터 M5까지의 report는 historical evidence로 보존하고, 새 제품 목표는 Source of Truth 문서에 반영했다.

이 결정 덕분에 팀은 두 가지를 동시에 잃지 않게 되었다. 하나는 이미 만들어진 작고 검증된 동작이고, 다른 하나는 앞으로 만들어야 할 더 큰 제품 방향이다. 현재 문서들은 이 둘을 계속 분리해서 설명한다.

## 하네스가 해주는 일

이 저장소에는 코드만 있는 것이 아니라, 사람과 AI가 함께 일하기 위한 협업 하네스가 들어 있다. 하네스는 한 번에 많은 일을 섞어 처리하지 않고, 작업을 Phase 단위로 나누게 해준다. 각 Phase는 별도 branch workspace를 가지고, 그 안에 계획, 기록, 품질 검증, 결정, 동기화 상태, 다음 행동, 최종 보고를 남긴다.

이 방식은 처음에는 조금 무겁게 보일 수 있다. 하지만 이 프로젝트처럼 제품 방향, 아키텍처, 인터페이스, 검증 기준, 병렬 개발 계획이 함께 움직이는 경우에는 작업 기록이 없으면 금방 헷갈린다. 하네스는 “무엇을 하기로 했는지”, “무엇은 이번 범위가 아닌지”, “어떤 검증을 했는지”, “사람이 어떤 결정을 했는지”, “PR 전에 무엇을 확인해야 하는지”를 남기게 한다.

또 하나 중요한 점은, 하네스가 AI에게 바로 구현부터 하지 말라고 요구한다는 것이다. 범위가 바뀌거나, 공통 계약이 바뀌거나, 검증 방식이 바뀌면 먼저 문서와 확인 절차를 거친다. 최근에는 Mid-Phase Steering 규칙도 추가했다. 사람이 작업 중간에 방향을 바꾸거나 아이디어를 던지면, AI는 그것을 현재 Phase 안의 작은 조정인지, 범위 변경인지, Hotfix인지, 다음 Phase 후보인지, 보류 아이디어인지, 큰 결정이 필요한 항목인지 먼저 분류한다. 이렇게 해서 사람이 자유롭게 조향하더라도 현재 작업이 흐트러지지 않게 했다.

## 병렬 개발을 위해 준비한 것

Target MVP는 한 줄로 순서대로만 개발하기에는 범위가 크다. Source 연결, Schema Inference, Transform/Normalize/Load, Catalog, Trust Gate, Job 상태, Query, Policy, Ask, Evidence, Recovery, Packaging 같은 부분이 서로 연결되어 있기 때문이다. 그래서 하네스는 Target MVP를 여러 workstream으로 나누고, 나중에 integration spine으로 이어 붙이는 방향을 잡았다.

여기서 workstream은 팀이 따로 맡을 수 있는 작업 흐름을 뜻한다. 예를 들어 Catalog / Trust는 데이터셋 상태와 신뢰 조건을 담당하고, Source Connector는 외부 source 연결과 schema 확인을 담당한다. Data Plane / Workflow는 스키마 추론, 사용자 보정, 변환, 정규화, 적재, row count, bytes, duration, output path 같은 처리 증거를 담당한다. Job / Orchestrator는 실행 상태를 기록하고, Query / Policy는 데이터셋을 조회해도 되는지 판단하는 흐름을 담당한다. Ask / Evidence는 자연어 질문과 근거 연결을 맡고, Recovery / Operate는 문제가 생겼을 때 영향과 복구를 보여준다. Packaging은 로컬 실행과 배포 준비를 담당한다.

병렬 개발에서 가장 중요한 것은 각 모듈이 서로 같은 언어를 쓰게 하는 것이다. 그래서 Modular Contract Baseline을 만들었다. 이 문서는 `Dataset`, `DatasetStatus`, `TrustGateResult`, `SourceConnection`, `JobRun`, `PolicyDecision`, `QueryExecution`, `EvidenceItem`, `RetrievalTrace`, `AssetImpact`, `RecoveryAction` 같은 공통 이름과 최소 필드를 정리한다. 쉽게 말하면, 각 모듈이 서로 주고받을 약속을 먼저 정한 것이다.

integration spine은 따로 만든 모듈들을 나중에 하나의 제품 흐름으로 이어 붙이는 순서다. 먼저 source에서 dataset draft가 만들어지고 trust gate 결과를 가진다. 그 다음 dataset 상태를 바탕으로 query가 허용되거나 차단된다. 그 뒤 query나 ask 결과가 evidence와 연결되고, 장애나 품질 실패가 생겼을 때 recovery 흐름으로 이어진다. 이 순서를 정해두면 여러 사람이 병렬로 개발해도 마지막에 무엇부터 합칠지 알 수 있다.

아직 모든 외부 시스템을 실제로 붙인 것은 아니다. 대신 mock, fake, fixture라는 임시 대역을 허용했다. 이것들은 실제 데이터베이스, 실제 LLM, 실제 Trino 같은 큰 시스템 없이도 각 모듈이 먼저 개발될 수 있게 해주는 가짜 입력과 결과다. 예를 들어 Query / Policy는 진짜 Query Engine이 없어도 adapter 경계와 fake dataset status로 허용과 차단을 검증할 수 있고, Ask / Evidence는 실제 LLM 없이도 정해진 질문과 정해진 근거로 화면과 흐름을 먼저 만들 수 있다.

## 현재 코드와 문서가 준비된 상태

현재 코드에는 초기 baseline을 위한 FastAPI 백엔드, React 프론트엔드, Docker Compose 실행 경로가 있다. 샘플 CSV source를 등록하고, catalog에서 schema, row count, sample rows, status를 확인하고, 간단한 pipeline run을 실행한 뒤 result dataset의 row count와 local 저장 위치를 확인하는 흐름은 current baseline으로 남아 있다.

Target MVP를 준비하기 위한 얇은 runtime skeleton도 생겼다. `backend/app/domain/target_contracts.py`에는 앞으로 workstream들이 공유할 계약 이름들이 Pydantic 모델로 내려와 있고, policy, query, job runner를 위한 port와 fake provider가 추가되어 있다. 이것은 실제 기능 완성이 아니라, 여러 모듈이 병렬로 개발될 때 서로 같은 계약을 참조할 수 있게 만든 얇은 뼈대다. frontend에도 catalog, source, job, query 같은 기능 폴더의 시작점이 생겼지만, 아직 모든 화면이 완성된 것은 아니다. 이 작업은 Thin Runtime Core라는 이름으로 기록되어 있다.

검증 쪽도 준비되어 있다. `scripts/validate-harness.sh`와 `scripts/test-harness.sh`가 하네스 문서와 규칙이 깨지지 않았는지 확인한다. strict validation은 current baseline과 Target MVP가 문서에서 섞이지 않는지도 확인한다. CI에서도 harness, container smoke, manifest smoke 같은 체크가 돌아간다. Docker처럼 로컬 runtime이 설치되어 있지만 꺼져 있는 경우에는 AI가 먼저 안전하게 켜보고, 그래도 안 되면 사람이 해야 할 일을 분리해서 기록하도록 Local Tool Runtime Readiness 규칙도 추가했다.

## 아직 제품 기능으로 완성되지 않은 것

지금까지의 Target MVP 작업은 개발 전 세팅과 방향 정리에 가깝다. Trust Gate, Query / Policy, Ask / Evidence, Recovery 같은 핵심 기능은 방향과 계약은 잡혔지만, 실제 사용자가 완성된 제품 기능으로 쓸 수 있는 상태는 아니다. 예를 들어 Dataset 상태인 `Draft`, `Verifying`, `Trusted`, `Blocked` 같은 이름은 정리되어 있지만, 실제 화면에서 완전한 게시 승인 흐름이 동작하는 단계는 아직 아니다. 대용량/복합 데이터셋의 schema inference, transform/normalize/load, Parquet 또는 S3-compatible output, row count/bytes/duration/output path 처리 증거도 아직 Target MVP 구현으로 완성된 상태가 아니다.

원문 기획서에는 Build, Trust, Analyze, Ask, Operate, Admin의 화면 경험과 사용자 여정이 훨씬 풍부하게 적혀 있다. 하지만 현재 Source of Truth 문서에는 그 모든 UX 디테일이 그대로 들어와 있지는 않다. 의도적으로 압축되어 있다. 그래서 화면 설계 Phase에 들어가면 원문 기획서에서 필요한 사용자 경험을 다시 꺼내어, 그 Phase에서 실제 구현 범위로 승격해야 한다.

또 실제 Trino, 외부 LLM, AWS, EKS, AWS S3, 대규모 vector store 같은 큰 인프라는 아직 도입하지 않았다. Query Engine은 특정 엔진이 아니라 adapter 경계로 두고, 저장소는 로컬 또는 MinIO 같은 S3-compatible 경로로 먼저 검증한다. 이런 것들은 비용, 권한, 보안, 운영 부담이 생길 수 있기 때문에 승인과 별도 결정 뒤에 진행해야 한다. 현재 하네스는 그런 큰 선택을 바로 구현하지 않고, Decision Option Brief와 approval gate를 거치도록 되어 있다.

## 다음 개발을 시작하는 방법

다음 단계는 모든 기능을 한 번에 완성하는 것이 아니라, 팀이 맡을 모듈을 먼저 정하고 공통 계약과 연결 순서를 확인한 뒤 얇은 slice부터 시작하는 것이다. 모듈 목록이 정해지면, 각 모듈이 어떤 책임을 가지는지, 어떤 입력과 출력을 주고받는지, 어떤 파일을 주로 수정하는지, 어디까지 mock이나 fake를 써도 되는지 정해야 한다.

병렬로 진행하려면 먼저 모듈 계약표와 integration spine을 확인한다. 이것은 새 규칙을 만드는 일이 아니라, 이미 하네스에 들어 있는 병렬 개발 규칙을 실제 개발 목록에 맞춰 적용하는 일이다. 그 다음 각 모듈별 branch workspace를 만들고, 실제 외부 시스템을 붙이기 전에 fake나 fixture로 제품 표면과 최소 흐름을 먼저 만든다.

처음 목표는 전체 AskLake를 완성하는 것이 아니라, 모듈들이 서로 말이 통하는 첫 흐름을 만드는 것이다. 예를 들어 source에서 dataset draft가 생기고, schema inference와 transform/normalize/load를 거쳐 output dataset과 처리 증거가 남고, trust gate가 pass 또는 fail 이유를 만들고, dataset 상태에 따라 query가 허용되거나 차단되며, 그 결과에 evidence가 붙는 흐름까지 얇게 연결하는 식이다. 이 흐름이 잡히면 이후에 실제 품질 엔진, 실제 권한 정책, 실제 Query Engine, 실제 Ask 경험, 실제 Recovery 기능을 더 안전하게 키울 수 있다.

## 지금까지의 결론

AskLake는 이제 단순한 아이디어나 원문 기획서만 있는 상태가 아니다. 작게 동작하는 current baseline이 있고, B2B SaaS 제품 방향과 `local/container` Target MVP 실행 범위가 분리되어 있으며, 대용량/복합 데이터셋 조작과 신뢰 증거를 중심으로 한 병렬 개발 맥락도 잡혀 있다. 동시에 아직 완성된 제품 기능은 제한적이라는 점도 분명하다.

지금 팀이 해야 할 일은 “전체 플랫폼을 한 번에 만들자”가 아니라, 어떤 모듈부터 병렬로 열지 정하고, 그 모듈들이 서로 연결되는 첫 흐름을 만드는 것이다. 하네스는 그 과정에서 범위가 커지는 것을 막고, 결정과 검증을 남기며, 팀원과 AI가 같은 맥락 위에서 일할 수 있게 도와주는 역할을 한다.
