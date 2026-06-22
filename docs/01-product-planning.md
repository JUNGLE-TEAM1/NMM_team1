# 01. 제품 기획

## 1) 한 줄 설명

AskLake는 XFlow를 참고해, 팀 프로젝트 규모에서 구현 가능한 경량 데이터 파이프라인 MVP를 만든다.

## 2) 문제 정의

### MVP 핵심 문제

- 데이터 활용자는 원천 데이터가 어디에 있고 어떤 형태인지 파악한 뒤, 반복 가능한 추출/변환/적재 흐름으로 결과 데이터를 만들고 싶다.
- MVP 핵심 가설: 복잡한 Airflow/Spark/Kubernetes 운영 없이도, 웹 UI에서 소스 등록, 간단한 변환, 실행, 결과 확인까지 한 번에 시연할 수 있으면 데이터 파이프라인 제품의 핵심 가치를 증명할 수 있다.

### 확장 문제

- 대용량 분산 처리, 실시간 CDC, Kafka, Airflow DAG 오케스트레이션, OpenSearch 검색, Trino/DuckDB SQL Lab, AI text-to-SQL은 MVP 이후 기능 확장으로 둔다.
- CI/CD, Docker, Kubernetes, AWS 배포 기반은 제품 기능 개발 전에 먼저 설계하고 최소 동작 경로를 세팅한다.

## 3) 대상 사용자

- 데이터 파이프라인을 직접 만들고 싶은 분석가 또는 데이터 엔지니어 입문자
- 팀 프로젝트 데모에서 데이터 흐름을 시각적으로 설명해야 하는 발표자
- 추후 자동화, 검색, 품질, AI 기능을 얹을 수 있는 기반을 확인하려는 팀원

## 4) 목표

- 프로젝트 요구사항, 범위, 검증 기준을 Source of Truth 문서에 남긴다.
- 기능 구현은 Phase 단위 branch workspace로 진행한다.
- 각 Phase는 수용 기준, 회귀 기준, 수동 검증, 보고서를 남긴다.

## 5) MVP 범위

### 핵심 기능

- 데이터 소스 등록: 최소 PostgreSQL 또는 CSV 파일 중 하나를 등록한다.
- 파이프라인 작성: source -> transform -> target 흐름을 UI나 간단한 form으로 정의한다.
- 기본 변환: 컬럼 선택과 row filter 중 최소 하나를 지원한다.
- 실행: 사용자가 파이프라인 실행을 요청하고 run status를 확인한다.
- 결과 확인: 생성된 결과 데이터의 schema, row count, sample 또는 저장 위치를 카탈로그 형태로 확인한다.

### 필수 연동

- GitHub Issue / PR / Project / Notion sync 흐름은 `.github/` 자동화로 관리한다.
- 제품 MVP 구현 전에 CI/CD, Docker image, Kubernetes manifest 또는 Helm 후보, AWS 배포 계정/권한/환경 전략을 먼저 정한다.
- AWS에서 비용이 발생하는 실제 resource 생성은 별도 승인 gate 뒤에 실행한다.
- local 실행 경로는 유지하지만, 개발 기준은 container-first와 deployable-first로 잡는다.

### 선택 확장

- React Flow 기반 시각적 파이프라인 에디터
- Airflow DAG 생성과 실행 연동
- Spark 기반 대용량 변환
- 데이터 카탈로그 검색과 lineage 시각화
- 데이터 품질 점수와 알림
- SQL Lab과 자연어 SQL assistant

## 6) MVP에서 제외할 범위

- Kafka/Debezium CDC
- OpenSearch, Trino, Redis, MongoDB 등 다중 인프라 필수화
- AWS Bedrock 또는 외부 LLM 의존 기능
- 다중 테넌트 권한, 관리자 콘솔, 조직/도메인 관리
- 대용량 성능 벤치마크와 운영 모니터링
- production-grade autoscaling, multi-AZ, full observability stack은 MVP 이후로 미룬다.

## 7) 주요 사용자 흐름

### 흐름 A. MVP 로드맵 정리

1. 팀이 XFlow 참고 범위에서 MVP에 넣을 기능과 미룰 기능을 구분한다.
2. `docs/01~08`에 MVP, 마일스톤, 수용 기준, 검증 경로를 기록한다.
3. 첫 구현 작업을 `scripts/start-workflow.sh`로 branch workspace에 기록한다.
4. PR 전 `scripts/status-workflow.sh`와 `scripts/validate-harness.sh --strict`로 상태를 확인한다.

### 흐름 B. MVP 핵심 시연 경로

1. 사용자가 데이터 소스를 등록한다.
2. 사용자가 source, transform, target을 포함한 간단한 파이프라인을 만든다.
3. 사용자가 실행 버튼을 누른다.
4. 시스템이 실행 상태와 로그 또는 오류를 보여준다.
5. 사용자가 결과 데이터의 schema, row count, sample 또는 저장 위치를 확인한다.

## 8) 마일스톤

### MVP 마일스톤

| 마일스톤 | 목표 | 데모 증거 | 완료 기준 |
| --- | --- | --- | --- |
| M0. MVP 범위 확정 | XFlow 참고 범위를 AskLake MVP로 축소하고 문서화 | `docs/01~08` MVP/마일스톤 반영 | 하네스 검증 통과, 다음 구현 Phase 후보 확정 |
| M1. 인프라 부트스트랩 | CI/CD, Docker, Kubernetes, AWS 전략을 먼저 확정 | CI workflow, Dockerfile, deployment manifest 초안, AWS env/secret 목록 | 실제 resource 생성 전 approval gate와 rollback/smoke 기준 기록 |
| M2. 앱 골격과 컨테이너 | React + FastAPI 후보 구조와 container build/run command 확정 | frontend/backend health, Docker build/run 성공 | local/container 실행/빌드 명령 기록, 개발 기본 포트와 smoke 전용 포트 분리 명시 |
| M3. 소스와 카탈로그 | 데이터 소스 등록과 카탈로그 목록/상세 표시 | 등록한 source가 카탈로그에 보임 | schema/sample 또는 연결 실패 메시지 확인 |
| M4. 최소 파이프라인 실행과 배포 smoke | source -> transform -> target 실행, container/K8s smoke 확인 | 실행 요청, status, 결과 위치/row count, 배포 smoke 결과 | happy path와 실패 path, 배포 smoke 수동 검증 |
| M5. 데모 정리 | 데모 흐름, 오류 메시지, report 정리 | 3분 내 golden path 시연 | release/submission gate 체크 |

### XFlow급 볼륨으로 가는 장기 마일스톤

AskLake는 XFlow를 그대로 복제하지 않는다. XFlow의 기능 볼륨은 참고하되, AskLake는 infrastructure-first foundation 위에서 MVP 기능을 얹고 이후 데이터 플랫폼 기능을 넓힌다.

각 마일스톤은 독립 branch로 구현 가능한 크기를 유지한다. AWS, EKS, S3, Bedrock, OpenSearch, Trino, Kafka, Spark, Airflow 같은 고비용/고복잡도 선택지는 설정/manifest/CI 검증과 실제 resource 생성 승인 gate를 분리한다.

| 마일스톤 | 목표 | 포함 기능 | 제외 기능 | 선행 조건 | 검증 방법 | 완료 기준 | 주요 리스크 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M6. 소스 확장 | CSV/local file 이후 PostgreSQL 또는 MySQL 연결을 추가한다. | connection test, schema preview, sample preview, 연결 실패 메시지 | MongoDB, S3, REST API 동시 확장 | M3 완료 | sample DB 연결, 잘못된 credential 실패 검증 | 최소 1개 RDB source가 catalog에 등록됨 | secret 관리와 local DB 재현성 |
| M7. 변환 확장 | MVP transform을 실사용 가능한 기본 세트로 넓힌다. | select fields, drop columns, filter, union, 간단 SQL transform | 복잡한 join 최적화, Spark SQL | M4 완료 | source별 transform 결과 row/schema 비교 | transform별 success/failed run 기록 | transform 정의와 결과 schema 불일치 |
| M8. 실행 관리 | 단발 실행을 job 중심 경험으로 확장한다. | run history, logs, retry, cancel 후보, schedule placeholder | Airflow DAG 필수화 | M4 완료 | 성공/실패/retry/cancel 수동 검증 | 사용자가 run 상태와 로그를 추적 가능 | 상태 전이 꼬임, partial output 처리 |
| M9. 카탈로그 고도화 | 결과 확인을 데이터 자산 관리로 확장한다. | dataset detail, owner/tags/domain, schema/sample/row count, basic search | OpenSearch/Nori 필수화 | M3, M4 완료 | 검색/filter와 상세 화면 수동 검증 | 데이터셋을 찾고 의미를 이해 가능 | metadata drift |
| M10. 품질 검사 | 결과 데이터 신뢰도를 표시한다. | row count, null check, duplicate check, quality score | alerting, 복잡한 통계 품질 규칙 | M9 완료 | 정상/불량 sample dataset 품질 비교 | 품질 결과가 catalog에 연결됨 | 품질 점수 오해, 대용량 성능 |
| M11. Lineage와 시각 편집 | 데이터 흐름을 시각적으로 이해하고 편집한다. | React Flow 기반 source/transform/target graph, lineage view, form fallback | 전체 DAG orchestration | M7, M9 완료 | graph 편집 후 pipeline 저장/실행 검증 | 시각 graph와 저장 contract 일치 | UI 복잡도 증가 |
| M12. SQL Lab | 결과 데이터를 직접 질의하는 분석 흐름을 제공한다. | DuckDB/local query, query history, result preview | Trino cluster 필수화 | M9 완료 | sample dataset SQL query 실행 | local query로 결과 탐색 가능 | query resource 제한, 보안 |
| M13. AI Assistant | AskLake식 질문 보조 경험을 붙인다. | schema-aware query help, SQL draft, pipeline 설명 보조 | 외부 LLM/Bedrock 필수화 | M9, M12 완료 | mock/local rule 기반 fallback과 승인된 LLM 경로 비교 | AI 없이도 core 기능 동작, AI는 보조로만 작동 | 비용, hallucination, prompt 보안 |
| M14. Streaming/CDC 후보 | 실시간 동기화가 필요한지 검증한다. | CDC discovery spike, Kafka/Debezium option brief, local simulation | production Kafka 필수화 | batch flow 안정화 | spike report와 decision brief | 도입/보류 결정이 근거와 함께 남음 | 운영 복잡도 과증가 |
| M15. 선택적 분산/클라우드 확장 | 대용량/운영 요구가 확인될 때만 확장한다. | S3, Spark, Airflow, Trino, OpenSearch, EKS option brief와 승인 gate | 무승인 cloud 비용 발생 | M6~M14 중 실제 병목 증거 | 비용/운영/rollback brief, 작은 PoC | 비용, 운영 부담, scope 폭증 |

## 9) 성공 기준

- MVP 데모에서 사용자는 소스 등록, 파이프라인 정의, 실행, 결과 확인을 한 흐름으로 설명할 수 있다.
- 첫 실제 기능 Phase가 branch workspace와 연결된다.
- 프로젝트별 실행, 테스트, 검증 명령이 `docs/04`와 workspace `quality.md`에 기록된다.
- PR에 linked GitHub issue가 있으면 `Closes #<issue-number>` 또는 동등한 closing keyword가 기록된다.

## 10) 결정 사항과 열린 질문

- 확정:
  - 이 저장소는 AskLake 프로젝트 운영용 하네스를 포함한다.
  - 초기 예시 workspace와 과거 Phase report는 가져오지 않는다.
  - XFlow는 참고 자료이며 코드를 복사하지 않는다.
  - 개발 시작 전에 CI/CD, Docker, Kubernetes, AWS 기반을 먼저 세팅한다.
  - 실제 AWS 비용이 발생하는 resource 생성은 승인 gate 뒤에 실행한다.
- 열림:
  - 첫 소스 타입을 PostgreSQL로 할지 CSV upload/local file로 할지 결정해야 한다.
  - metadata store를 PostgreSQL, SQLite, 또는 JSON/file 기반으로 시작할지 결정해야 한다.
  - 실제 실행/test/build 명령은 프로젝트 코드 생성 후 확정해야 한다.
