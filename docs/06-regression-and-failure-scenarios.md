# 06. 회귀 보호와 실패 시나리오

이 문서는 깨지면 안 되는 동작과 실패 시 기대 동작을 정의한다.

## 목적

- 이미 구현되었거나 합의된 동작을 보호한다.
- 실패와 fallback의 기대 동작을 정의한다.
- 회귀/실패 확인을 manual verification과 Phase report에 연결한다.

## 사용 방법

1. Phase 시작 전 관련 Regression Guard를 읽는다.
2. 완료 전 관련 Failure Scenario를 최소 1개 검토한다.
3. 자동 테스트가 없으면 관련 manual verification을 실행한다.
4. 결과를 Phase report에 기록한다.

## 기능 회귀 보호

### 프로젝트 하네스 정체성

| 항목 | 내용 |
| --- | --- |
| Must not break | 이 저장소는 AskLake 프로젝트 운영 문서와 검증 하네스를 포함한다. |
| Failure condition | 핵심 문서가 다시 “다른 프로젝트에 복사하는 패키지”로 설명된다. |
| Expected behavior | README, AGENTS, product planning, workflow docs가 현재 프로젝트 운영 기준을 설명한다. |
| Verification method | README, AGENTS, `docs/01`, `docs/08`을 수동 검토하고 프로젝트 외부 적용 안내나 예시 프로젝트 설명이 핵심 문서에 남아 있지 않은지 확인한다. |
| Related docs/interface/Phase | `README.md`, `AGENTS.md`, `docs/01`, `docs/08` |

### Branch Workspace 깨끗한 시작

| 항목 | 내용 |
| --- | --- |
| Must not break | `docs/workflows/`는 실제 작업 workspace만 담고, 초기 적용 상태에서는 예시 workspace 없이 시작할 수 있다. |
| Failure condition | 시뮬레이션 workspace가 실제 프로젝트 작업처럼 남아 혼동을 만든다. |
| Expected behavior | `docs/workflows/README.md`만 기본으로 남고, 실제 작업 시 `scripts/start-workflow.sh`로 workspace를 만든다. |
| Verification method | `find docs/workflows -mindepth 2 -maxdepth 2 -type d` |
| Related docs/interface/Phase | `docs/workflows/README.md`, `scripts/start-workflow.sh` |

### Linked Issue PR 자동 종료

| 항목 | 내용 |
| --- | --- |
| Must not break | linked GitHub issue가 있는 PR은 merge 후 issue가 자동 close될 수 있어야 한다. |
| Failure condition | `sync.md`나 PR body에 `Closes #<issue-number>` 또는 동등한 closing keyword가 없다. |
| Expected behavior | PR 준비 전 linked issue와 closing keyword를 확인한다. |
| Verification method | `scripts/status-workflow.sh <workspace>`와 PR template 확인 |
| Related docs/interface/Phase | `docs/03`, `docs/04`, `.github/pull_request_template.md` |

### MVP 범위 경계

| 항목 | 내용 |
| --- | --- |
| Must not break | XFlow 참고 기능이 MVP에 무제한으로 들어오지 않는다. |
| Failure condition | Airflow, Spark, Kafka, OpenSearch, Trino, Bedrock 같은 데이터 플랫폼 확장 기능이 첫 MVP 필수 조건으로 추가된다. |
| Expected behavior | CI/CD, Docker, Kubernetes, AWS foundation은 선행하되, 제품 MVP 기능은 데이터 소스 등록, 최소 변환, 실행, 결과 확인으로 제한한다. |
| Verification method | `docs/01`, `docs/02`, `docs/08`에서 Non-MVP와 milestone 범위를 확인한다. |
| Related docs/interface/Phase | `docs/01`, `docs/02`, `docs/08` |

### 파이프라인 결과 무결성

| 항목 | 내용 |
| --- | --- |
| Must not break | 실패한 pipeline run이 성공한 catalog dataset처럼 표시되지 않는다. |
| Failure condition | 실행 실패 또는 partial output이 `ready`/`success` 상태로 노출된다. |
| Expected behavior | run status는 `failed`가 되고 catalog는 not ready 또는 failed 상태를 보여준다. |
| Verification method | 실패하는 sample source/transform으로 run을 실행하고 UI/API 상태를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07` |

### Container App Health

| 항목 | 내용 |
| --- | --- |
| Must not break | backend health API와 frontend 정적 앱이 container-first 실행 경로에서 응답한다. |
| Failure condition | `GET /health` 또는 `GET /api/health`가 200/ok contract를 반환하지 않거나 frontend container가 `/`를 제공하지 않는다. |
| Expected behavior | `scripts/smoke-container-app.sh`가 backend/frontend image build, compose up, health/frontend curl을 통과한다. |
| Verification method | `scripts/smoke-container-app.sh` |
| Related docs/interface/Phase | `docs/03`, `docs/04`, `docs/08`, M2 `feature/container-app-skeleton` |

## 기능 실패 시나리오

### 예시 산출물이 다시 들어오는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 운영 문서가 초기 예시 산출물로 다시 오염되지 않는다. |
| Failure condition | 과거 시뮬레이션 report나 example workspace가 기본 운영 경로에 추가된다. |
| Expected behavior | 예시는 필요할 때 별도 Phase에서 명시적으로 추가하고, 기본 `docs/workflows/`와 `docs/reports/`는 실제 작업만 담는다. |
| Verification method | `find docs/workflows -mindepth 2 -maxdepth 2 -type d` and `find docs/reports -maxdepth 1 -name "phase-*.md"` |
| Related docs/interface/Phase | `docs/workflows/`, `docs/reports/` |

### 프로젝트별 명령이 없는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 실제 기능 Phase 전에 실행/test/build 명령이 확인된다. |
| Failure condition | 기능 구현 완료를 선언했지만 `quality.md`에 실행한 검증 명령이나 skip reason이 없다. |
| Expected behavior | 프로젝트별 명령을 확정하거나, 미확정이면 deferral reason을 기록한다. |
| Verification method | workspace `quality.md`, `scripts/status-workflow.sh <workspace>` |
| Related docs/interface/Phase | `docs/04`, `docs/12`, workspace `quality.md` |

### AWS resource가 승인 없이 생성되는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 비용이 발생하는 AWS resource는 승인 gate 없이 생성되지 않는다. |
| Failure condition | EKS, ECR, S3, RDS, OpenSearch, Bedrock 등 비용/권한 영향이 있는 resource를 확인 없이 만든다. |
| Expected behavior | IaC/manifest/CI 설정은 준비할 수 있지만 실제 생성은 비용/권한/rollback 확인 뒤 진행한다. |
| Verification method | `docs/02` env/operations와 `docs/08` milestone scope 확인 |
| Related docs/interface/Phase | `docs/01`, `docs/02`, `docs/08` |

### 장기 로드맵이 MVP를 덮어쓰는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | M5 이후 장기 로드맵이 M1~M4 MVP 완료 기준을 키우지 않는다. |
| Failure condition | MVP 완료 기준에 Kafka, Spark, Airflow, OpenSearch, Trino, Bedrock 같은 확장 기능이 필수로 들어간다. |
| Expected behavior | 인프라 foundation은 먼저 만들되, XFlow급 데이터 플랫폼 기능은 M6 이후 milestone으로 분리한다. |
| Verification method | `docs/01`, `docs/05`, `docs/08`에서 MVP와 장기 로드맵 섹션이 분리되어 있는지 확인한다. |
| Related docs/interface/Phase | `docs/01`, `docs/05`, `docs/08` |

### 고비용 인프라 승인 누락

| 항목 | 내용 |
| --- | --- |
| Must not break | 비용이 발생하거나 운영 부담이 큰 인프라는 승인 gate 없이 필수화되지 않는다. |
| Failure condition | AWS, EKS, S3, Bedrock, OpenSearch, Trino, Kafka, Spark, Airflow를 승인 없이 기본 실행 경로에 넣는다. |
| Expected behavior | 각 고비용 기능은 container/local smoke 대체 경로와 option brief를 가진 뒤 승인된 Phase에서만 구현한다. |
| Verification method | workspace `decisions.md`, `shared-docs.md`, `quality.md`, 관련 Phase report 확인 |
| Related docs/interface/Phase | `docs/02`, `docs/08`, workspace `decisions.md` |

### CI/CD 우회

| 항목 | 내용 |
| --- | --- |
| Must not break | 제품 기능은 CI/CD와 container smoke를 우회해 완료 처리되지 않는다. |
| Failure condition | build/test/harness validation 또는 deploy smoke 없이 기능 완료를 선언한다. |
| Expected behavior | 최소 CI job과 container smoke 결과 또는 명확한 deferral reason을 `quality.md`와 report에 기록한다. |
| Verification method | workspace `quality.md`, GitHub Actions 결과 또는 local 동등 명령 확인 |
| Related docs/interface/Phase | `docs/04`, `docs/05`, `docs/08`, workspace `quality.md` |

## 공통 인프라 실패 시나리오

- 필수 environment variable 누락
- data store 사용 불가
- migration/data 변경 실패
- external provider timeout/error
- background job 실패
- auth/access-control 실패
- file 또는 input validation 실패

## Phase Report 최소 형식

```text
Regression Guard:
- Checked feature:
- Protected behavior:
- Result:

Failure Scenario:
- Reviewed failure:
- Expected behavior:
- Verification:
- Result:
```
