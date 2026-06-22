# 07. 수동 검증 플레이북

이 문서는 수동 검증의 라우터다. 세부 절차는 `docs/manual-verification/` 아래 문서에 둔다.

## 목적

- 자동 테스트만으로 충분히 확인하기 어려운 demo, UX, integration, 사람-facing flow를 검증한다.
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

## 세부 검증 문서

- [환경 설정](manual-verification/00-environment-setup.md)
- [핵심 성공 경로](manual-verification/01-golden-path.md)
- [핵심 기능](manual-verification/02-core-feature.md)
- [인증 또는 접근 제어](manual-verification/03-auth-or-access-control.md)
- [데이터 흐름](manual-verification/04-data-flow.md)
- [통합](manual-verification/05-integration.md)
- [실패 시나리오](manual-verification/06-failure-scenarios.md)

## AskLake 최소 수동 점검

1. `README.md`가 AskLake 프로젝트 작업을 설명하는지 확인한다.
2. `AGENTS.md`의 Source of Truth, context loading, reporting rule이 이 저장소 기준인지 확인한다.
3. `docs/01-product-planning.md`에 현재 MVP 질문 또는 요구사항이 기록되어 있는지 확인한다.
4. `docs/08-development-workflow.md`의 다음 Phase가 project bootstrap 또는 실제 project feature인지 확인한다.
5. `docs/workflows/`에 실제 branch와 연결되지 않은 stale example workspace가 없는지 확인한다.
6. PR handoff 전에 linked GitHub issue가 workspace `sync.md`에 기록되어 있는지 확인한다.

## Container App Skeleton 수동 점검

1. `scripts/smoke-container-app.sh`를 실행한다.
2. 필요하면 `BACKEND_PORT=18000 FRONTEND_PORT=13000 COMPOSE_PROJECT_NAME=asklake_m2_visual docker compose -p asklake_m2_visual up -d`로 앱을 띄운다.
3. `curl -fsS http://localhost:18000/health`가 `status: ok` contract를 반환하는지 확인한다.
4. `curl -fsS http://localhost:13000/`가 AskLake frontend HTML을 반환하는지 확인한다.
5. 확인 뒤 `docker compose -p asklake_m2_visual down --remove-orphans`로 내린다.

## Source Catalog 수동 점검

1. `docker compose up`으로 backend/frontend를 실행한다.
2. frontend에서 `sample_orders`, `samples/orders.csv`를 등록한다.
3. catalog detail에서 schema, row count, sample rows, ready status를 확인한다.
4. `curl -fsS http://localhost:8000/api/catalog/datasets`로 API 결과를 확인한다.
5. 없는 path로 source 등록을 시도해 ready dataset으로 저장되지 않는지 확인한다.

## MVP 데이터 파이프라인 수동 점검

1. local app을 실행하고 frontend와 backend health가 열리는지 확인한다.
2. 샘플 데이터 소스를 등록한다.
3. 컬럼 선택 또는 row filter가 포함된 최소 pipeline을 만든다.
4. pipeline run을 실행한다.
5. run status가 success 또는 failed로 명확히 표시되는지 확인한다.
6. success인 경우 catalog에서 schema, row count, sample 또는 저장 위치를 확인한다.
7. 실패 케이스 하나를 실행해 failed 상태와 오류 메시지가 표시되는지 확인한다.

## Phase Report 기록 형식

```text
Manual Verification:
- Document executed:
- Environment:
- Result:
- Failure/limitation:
- Evidence:
```
