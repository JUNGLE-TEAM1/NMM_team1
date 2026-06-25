# M1 UI Shell 계획

## 목적

이 문서는 M1 플랫폼 코어·통합 담당자가 `origin/demo3` 프론트엔드 UI를 AskLake M1 UI Shell로 정제해 가져올 때의 실행 계획이다.

M1의 목표는 기능 완성이 아니라 M2~M6가 붙을 수 있는 통합 가능한 화면 골격과 연결 지점을 만드는 것이다. demo3의 발표용 가짜 동작은 제품 동작으로 가져오지 않는다.

## 기준 결정

| 항목 | 결정 |
| --- | --- |
| M1 성격 | 전체 UI Shell + Integration Surface |
| demo3 사용 방식 | UI 구조와 화면 패턴 참고, 필요한 파일만 선별 이식 |
| demo 연출 | 제거 또는 이식 제외 |
| 연결 전 화면 상태 | 빈 상태, 로딩, 에러, 연결 예정, API 연결 대기처럼 테스트 가능한 상태 |
| 실제 기능 구현 | M2~M6 범위로 유지 |
| 최종 시나리오 테스트 | M1 완료 조건이 아니라 M2~M6 연결 후 통합 검증 |

## 포함 범위

- `origin/demo3:frontend`의 layout, sidebar, routing, page shell, 주요 컴포넌트 구조 검토와 선별 이식
- Source, Schema Preview, Run Status, Catalog, AI Query 화면 자리 구성
- AskLake 브랜딩과 문구 정리
- API adapter 또는 route boundary 자리 생성
- M2~M6가 연결할 component, route, adapter 위치 정리
- `contracts/*.sample.json` 기반 placeholder 또는 fixture 렌더링 검토
- `npm build`와 핵심 route smoke 기준 수립

## 제외 범위

- demo3의 `window.fetch` 전역 mock
- `localStorage` fake backend
- 자동 mock login 또는 frontend-only admin user
- `setTimeout` 기반 자동 성공/완료 연출
- fake run transition을 실제 실행 결과처럼 보여주는 동작
- M2 Batch, M3 JSON/Schema, M4 Kafka, M5 Workflow/Catalog, M6 RAG/AI Query 실제 구현
- production에서 demo/fake 동작이 켜지는 설정
- XFlow 브랜드, storage key, bucket/path, email, stream group 이름 유지

## Phase 분해

### M1-1 Demo UI Intake & Shell 이식 계획

목표:

- demo3 frontend 구조를 분석하고 가져올 UI와 버릴 demo 동작을 구분한다.

작업:

- `origin/demo3:frontend/src` 파일 구조 확인
- page, component, service, context, mock, asset 역할 분류
- `mocks/mockApi.js`, `AuthContext`, `JobsPage`, `etl_job`, `SqlLabPage`, `demoAiQueryData`의 fake/demo 동작 목록화
- dependency, Tailwind, router 적용 방식 결정
- AskLake 브랜딩 전환 대상 확인

완료 기준:

- 가져올 것/버릴 것 표가 workspace `plan.md` 또는 `notes.md`에 기록된다.
- demo 연출 제거 기준이 M1 workspace `decisions.md`에 기록된다.

### M1-2 UI Shell 구현

목표:

- AskLake 앱에서 주요 화면이 route와 shell 수준으로 이동 가능하고 build된다.

작업:

- layout/sidebar/topbar/page shell 이식
- Source, Schema Preview, Run Status, Catalog, AI Query route 자리 구성
- 연결 전 상태를 success처럼 보이지 않는 placeholder로 정리
- XFlow 표기와 asset 경로를 AskLake 기준으로 정리
- demo3 API 호출부는 직접 실행하지 않고 adapter boundary로 감싼다.

완료 기준:

- frontend build가 통과한다.
- 주요 route가 빈 상태/연결 예정 상태로 렌더링된다.
- 전역 fetch mock, 자동 로그인, 자동 성공 연출이 없다.

### M1-3 Integration Surface & Handoff

목표:

- M2~M6가 붙을 위치와 계약을 화면별로 명확히 한다.

작업:

- M2 Batch 연결 지점: batch source/run metrics 표시 위치
- M3 JSON/Schema 연결 지점: schema preview/override 표시 위치
- M4 Kafka 연결 지점: streaming status/throughput/lag 표시 위치
- M5 Workflow/Catalog 연결 지점: run status, logs, retry, catalog/lineage 표시 위치
- M6 RAG/AI Query 연결 지점: `AIQueryResult`, `query_result`, summary, chart spec 표시 위치
- `/api/week2/*` draft route를 사용할지 existing baseline API adapter를 둘지 M1 workspace `decisions.md`에 기록

완료 기준:

- M2~M6 연결 포인트 표가 workspace `shared-docs.md` 또는 `handoff` 성격 문서에 기록된다.
- 연결 전 placeholder와 실제 연결 후 expected data shape가 구분된다.

### M1-4 Smoke & Report

목표:

- M1 UI Shell이 다음 모듈 연결을 받을 준비가 됐음을 검증한다.

검증:

```bash
cd frontend && npm build
rg -n "window.fetch|__xflowMock|VITE_FRONTEND_ONLY|frontendOnly|mock-session|study@xflow|xflow.frontendOnly|created_from_pipeline_demo|setTimeout\\(.*success" frontend/src
rg -n "XFlow|xflow|xflows|xflow-demo" frontend/src frontend/index.html frontend/package.json
```

수동 smoke:

- 앱 첫 화면 진입
- Sidebar route 이동
- Source 화면 빈 상태 확인
- Schema Preview 화면 연결 예정 상태 확인
- Run Status 화면 실행 결과 없음 상태 확인
- Catalog 화면 데이터 없음 또는 fixture 대기 상태 확인
- AI Query 화면 연결 대기 상태 확인

완료 기준:

- build 결과가 기록된다.
- 핵심 route smoke 결과가 workspace `quality.md`에 기록된다.
- demo 연출 제거 확인 결과가 기록된다.
- M2~M6 연결 전 남은 gap이 `next-actions.md`에 기록된다.
- Phase report가 작성된다.

## demo3에서 가져올 것 / 버릴 것

| 구분 | 대상 | 처리 |
| --- | --- | --- |
| 가져올 것 | `components/layout/MainLayout.jsx`, `Sidebar.jsx` 구조 | AskLake route와 권한 없는 shell 기준으로 정리 |
| 가져올 것 | 주요 page shell 구조 | 실제 기능 호출 제거 후 placeholder/adapter 연결 |
| 가져올 것 | table, form, modal, toast, panel UI 패턴 | 필요한 범위만 선별 |
| 가져올 것 | `@xyflow/react` 기반 canvas UI 패턴 | M5 Workflow 연결 전에는 실행 성공으로 보이지 않게 둠 |
| 재작성 | seed data | `contracts/*.sample.json` 또는 M1 fixture로 재정의 |
| 버릴 것 | `mocks/mockApi.js` 전역 fetch interception | 제품 UI Shell에 이식하지 않음 |
| 버릴 것 | `AuthContext` frontend-only 자동 admin | M1 Demo Tenant 식별은 명시적 fixture 또는 backend shell로 처리 |
| 버릴 것 | `JobsPage` fake run complete | M5 `ExecutionResult` 연결 전에는 실행 결과 없음 상태 |
| 버릴 것 | `etl_job` 자동 Gold Dataset 생성/저장 성공 | M3/M5 연결 후 실제 계약으로 대체 |
| 버릴 것 | `SqlLabPage` 고정 AI/RAG 분석 성공 연출 | M6 `AIQueryResult` 연결 전에는 연결 대기 상태 |

## M2~M6 연결 포인트

| 모듈 | M1 화면/adapter 책임 | 받는 계약 |
| --- | --- | --- |
| M2 Batch | batch source/run metrics를 표시할 영역과 API client 자리 | `ExecutionResult`, `CatalogMetadata` |
| M3 JSON/Schema | JSON source 등록, schema preview, override 화면 자리 | `SourceConfig`, `SchemaDefinition` |
| M4 Kafka | streaming source/status/lag/throughput 표시 자리 | `SourceConfig`, `ExecutionResult` |
| M5 Workflow/Catalog | workflow run, run status, retry/log, catalog/lineage route 자리 | `WorkflowDefinition`, `ExecutionResult`, `CatalogMetadata` |
| M6 RAG/AI Query | question input, selected dataset, evidence, SQL result, chart spec 표시 자리 | `AIQueryResult`, `QueryResult` |

## 위험과 rollback 기준

| 위험 | 신호 | 대응 |
| --- | --- | --- |
| demo 연출이 실제 기능처럼 남음 | 클릭만으로 success/trusted/complete가 표시됨 | 해당 동작 제거, placeholder로 대체 |
| production fake 동작 | env 기본값으로 mock이 켜짐 | fake env 제거, test/dev fixture만 명시 |
| 전체 UI 이식으로 build 불안정 | dependency 충돌 또는 라우팅 오류 | M1-2 범위를 layout/page shell로 축소 |
| M2~M6 계약과 UI state 불일치 | 화면 필드가 `contracts/*.sample.json`과 다름 | adapter boundary에서 변환하거나 `docs/03` 변경 제안 |
| XFlow 잔여 표기 | UI, storage key, path, email에 XFlow 남음 | AskLake 기준으로 치환하거나 제거 |

## 바로 다음 실행 Phase 추천

Recommended: `feature/m1-ui-shell`

첫 실행 범위:

1. branch workspace 생성
2. M1-1 intake 기록
3. M1-2 layout/sidebar/routing/page shell 이식
4. demo 연출 제거 확인
5. build와 route smoke

M1-3 integration handoff는 M1-2 build가 안정된 뒤 같은 M1 branch에서 이어가거나, 변경량이 커지면 후속 M1 integration-surface Phase로 분리한다.
