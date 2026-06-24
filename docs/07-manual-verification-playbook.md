# 07. 수동 검증 플레이북

이 문서는 수동 검증의 라우터다. 세부 절차는 `docs/manual-verification/` 아래 문서에 둔다.

## 목적

- 자동 테스트만으로 충분히 확인하기 어려운 demo, UX, integration, 사람-facing flow를 검증한다.
- current baseline과 Target MVP 검증 경로를 구분한다.
- 수동 검증 증거를 Phase report에 기록한다.
- 실패한 수동 검증을 `docs/06` failure scenario 또는 현재 Phase TODO와 연결한다.

## 사용 시점

- Phase 완료 전
- release/demo rehearsal 전
- UX, integration, external-provider 변경 후
- Hotfix 후
- 자동 테스트가 없거나 충분하지 않을 때

## 실행 규칙

1. Phase 완료 전 관련 manual verification 문서 하나 이상을 실행한다.
2. 결과는 `docs/reports/_template.md` 형식의 Phase report에 기록한다.
3. demo/UX 품질은 manual verification concern으로 다룬다.
4. 실패는 `docs/06` Failure Scenario와 report TODO에 연결한다.
5. manual verification에 필요한 local tool/runtime이 있으면 AI는 먼저 readiness check와 safe start를 시도하고, 설치/권한/라이선스/비용/외부 resource가 필요한 사람 조치만 분리해 기록한다.

## 세부 검증 문서

- [환경 설정](manual-verification/00-environment-setup.md)
- [핵심 성공 경로](manual-verification/01-golden-path.md)
- [핵심 기능](manual-verification/02-core-feature.md)
- [인증 또는 접근 제어](manual-verification/03-auth-or-access-control.md)
- [데이터 흐름](manual-verification/04-data-flow.md)
- [통합](manual-verification/05-integration.md)
- [실패 시나리오](manual-verification/06-failure-scenarios.md)
- [MVP 데모 스크립트](manual-verification/07-mvp-demo-script.md)

## AskLake 문서 Rebaseline 수동 점검

1. `README.md`가 AskLake를 Trusted Data & AI Platform 방향으로 설명하는지 확인한다.
2. `README.md`와 `docs/01-product-planning.md`가 current implementation baseline을 제품 목표와 구분하는지 확인한다.
3. `docs/01-product-planning.md`에 Target MVP가 `Trusted Dataset -> Query/Ask -> Evidence -> Recovery` 신뢰 루프로 기록되어 있는지 확인한다.
4. `docs/02-architecture.md`에 current baseline과 target architecture가 분리되어 있는지 확인한다.
5. `docs/03-interface-reference.md`에 baseline contract와 Target MVP interface family가 분리되어 있는지 확인한다.
6. `docs/05`, `docs/06`, `docs/07`, `docs/08`이 같은 milestone/phase 이름을 사용하는지 확인한다.
7. 과거 M0~M5 report가 historical evidence로만 남고 새 기준에 맞춰 소급 수정되지 않았는지 확인한다.

## Current Baseline 수동 점검

0. Docker가 필요한 경우 `command -v docker`, `docker --version`, `docker compose version`, `docker info`를 확인한다. macOS에서 `/Applications/Docker.app`이 설치되어 있고 꺼져 있으면 macOS 전용 safe start로 `open -a Docker`를 시도한 뒤 readiness loop를 돈다. Windows는 WSL2 + Docker Desktop integration shell에서 검증하는 것을 기본 경로로 두고, native PowerShell/CMD 동일 실행은 별도 evidence 없이는 미검증으로 기록한다. host `node`/`npm`은 Docker Compose Tier 1 경로에는 필수가 아니며, host frontend direct run을 검증할 때만 추가로 확인한다.
1. `scripts/smoke-container-app.sh`를 실행한다. WSL2 경로에서 `docker-buildx` plugin 또는 `docker-credential-desktop.exe` 문제가 있으면 스크립트가 local-only fallback을 자동 재시도한다. 그래도 실패하면 필요한 경우 `DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 scripts/smoke-container-app.sh` 같은 명시 fallback과 오류 출력을 함께 기록한다.
2. 필요하면 `BACKEND_PORT=18000 FRONTEND_PORT=13000 COMPOSE_PROJECT_NAME=asklake_m2_visual docker compose -p asklake_m2_visual up -d`로 앱을 띄운다.
3. `curl -fsS http://localhost:18000/health`가 `status: ok` contract를 반환하는지 확인한다.
4. `curl -fsS http://localhost:13000/`가 AskLake frontend HTML을 반환하는지 확인한다.
5. 샘플 CSV source를 등록한다.
6. catalog detail에서 schema, row count, sample rows, ready status를 확인한다.
7. `select_fields` 컬럼 선택 기반 최소 pipeline을 만든다.
8. pipeline run을 실행한다.
9. run status가 success 또는 failed로 명확히 표시되는지 확인한다.
10. success인 경우 catalog에서 schema, row count, sample 또는 저장 위치를 확인한다.
11. 실패 케이스 하나를 실행해 failed 상태와 오류 메시지가 표시되는지 확인한다.
12. 확인 뒤 필요한 경우 docker compose를 내린다.

## Target MVP 수동 점검 후보

Target MVP 기능이 구현될 때 아래 경로를 단계별로 실제 manual verification 문서로 승격한다.

### Modular Contract Baseline 점검

1. `docs/03-interface-reference.md`에 `Dataset`, `TrustGateResult`, `PolicyDecision`, `EvidenceItem`, `AuditEvent` 같은 shared contract가 있는지 확인한다.
2. 각 contract가 owner workstream과 mock/fake boundary를 가진지 확인한다.
3. `docs/08-development-workflow.md`가 R1~R7을 workstream alias로 보존하고, 실행은 Workstream Pool과 Integration Spine으로 안내하는지 확인한다.
4. `.milestones/target-mvp/manifest.yaml`이 workstream scope, contracts, integration checkpoint를 포함하는지 확인한다.
5. Query/Ask workstream이 실제 Trust 구현 전에는 mock/fake policy boundary 안에서만 진행되도록 기록되어 있는지 확인한다.
6. 첫 병렬 wave와 integration checkpoint가 `docs/05` acceptance checkpoint와 연결되는지 확인한다.

### Trust Gate 점검

1. source를 등록하고 schema discovery 결과를 확인한다.
2. catalog draft가 생성되는지 확인한다.
3. dataset status가 `Draft` 또는 `Verifying`으로 시작하는지 확인한다.
4. quality, PII, owner, access policy, approval gate 중 남은 조건이 표시되는지 확인한다.
5. 조건 미충족 dataset이 일반 Query/Ask 후보로 노출되지 않는지 확인한다.
6. 모든 필수 조건이 충족된 뒤에만 `Trusted`로 전환되는지 확인한다.
7. gate 실패 시 `Blocked` 또는 제한 상태와 이유가 표시되는지 확인한다.

### Query / Access 점검

1. `Trusted` dataset에서 Query를 실행한다.
2. Query 실행 전 policy preflight 결과를 확인한다.
3. 권한 없는 column 또는 dataset으로 Query를 시도한다.
4. 차단된 자원, 필요한 권한, masking 대안, access request 경로가 표시되는지 확인한다.
5. query execution 결과가 audit event와 연결되는지 확인한다.

### Ask / Evidence 점검

1. 단일 dataset 수치 질문을 Ask에 입력한다.
2. 여러 dataset join 질문을 Ask에 입력한다.
3. 문서 근거가 필요한 질문을 Ask에 입력한다.
4. 근거 없는 질문 또는 지원하지 않는 예측 질문을 입력한다.
5. 권한 없는 데이터가 필요한 질문을 입력한다.
6. 답변에 SQL, dataset, metric, document chunk, freshness, lineage, retrieval trace evidence가 연결되는지 확인한다.
7. 근거 부족 또는 권한 거부 케이스가 confident answer로 표시되지 않는지 확인한다.

### Recovery 점검

1. schema drift 또는 quality failure sample을 준비한다.
2. 실패한 task와 영향을 받는 dataset/query/dashboard/AI index가 표시되는지 확인한다.
3. dataset이 `Degraded` 또는 `Blocked`로 전환되는지 확인한다.
4. retry/rerun/backfill 범위와 idempotency 기준을 확인한다.
5. 복구 후 quality/freshness를 재검증하는지 확인한다.
6. 중복 또는 누락 없이 상태가 정상화되는지 확인한다.
7. incident, audit event, notification 기록이 남는지 확인한다.

## Phase Report 기록 형식

```text
Manual Verification:
- Document executed:
- Environment:
- Result:
- Failure/limitation:
- Evidence:
```
