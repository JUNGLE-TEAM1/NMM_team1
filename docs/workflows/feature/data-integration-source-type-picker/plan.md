# 데이터 통합 Source Type Picker 보정 계획

## 브랜치

- Branch: `feature/data-integration-source-type-picker`
- Workspace: `docs/workflows/feature/data-integration-source-type-picker`
- Created: 2026-06-29

## 선행 조건

- `feature/data-integration-source-step`에서 Source 선택 모달 방향을 확인했다.
- 사람 피드백: "종류"는 Source/Target이 아니라 XFlow식 `Kafka`, `CSV`, `PostgreSQL`, `MongoDB`, `API`, `S3` 같은 데이터 소스 타입이다.

## 목표

- `새 파이프라인 만들기` 클릭 후 source type을 먼저 고르고, 해당 type에 맞는 dataset 카드를 검색/정렬/필터링해 선택할 수 있게 한다.
- 선택 결과는 기존 Source 카드와 schema preview에 반영한다.

## 범위

- 데이터 통합 화면의 Source 시작 모달만 보정한다.
- source type taxonomy를 UI에 둔다: `전체`, `CSV`, `Kafka`, `PostgreSQL`, `MongoDB`, `API`, `S3`.
- type 선택 후 dataset 카드 목록을 표시한다.
- dataset 카드 목록에는 검색, 정렬, type 메뉴/전체 보기 기능을 둔다.
- 정렬 옵션은 `최근 수정순`, `이름순`, `상태순`, `컬럼 수 많은 순`을 제공한다.
- 이번 Phase는 demo-safe dataset fixture를 사용한다.
- dataset 선택 결과는 Source 카드의 `선택됨` 상태와 schema preview chip에 반영한다.

## 범위 제외

- 실제 source dataset API 연결.
- 실제 Kafka/CSV/PostgreSQL/MongoDB/API/S3 connector 구현.
- 파일 업로드, credential 입력, connection test.
- Transform/Target/Run 구현.
- backend/API/schema 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/01-product-planning.md`
- `docs/08-development-workflow.md`
- `docs/workflows/feature/data-integration-source-step/plan.md`
- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- XFlow reference: `/Users/tail1/Documents/데이터 파이프라인/xflow/frontend/src/pages/etl/etl_main.jsx`
- XFlow reference: `/Users/tail1/Documents/데이터 파이프라인/xflow/frontend/src/components/etl/CreateDatasetModal.jsx`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/01-product-planning.md @docs/08-development-workflow.md @docs/workflows/feature/data-integration-source-step/plan.md

`feature/data-integration-source-type-picker` branch workspace 범위만 구현한다.
`새 파이프라인 만들기` 버튼이 여는 Source 시작 모달을 source type picker + dataset card selector로 보정한다.
source type은 `전체`, `CSV`, `Kafka`, `PostgreSQL`, `MongoDB`, `API`, `S3`를 제공한다.
type 선택 시 해당 type dataset 카드만 보이고, `전체` 선택 시 모든 카드가 보인다.
dataset 카드 목록에는 검색, 정렬, type 메뉴를 제공한다.
dataset 선택 결과는 Source 카드와 schema preview에 반영한다.
실제 source API/connector/backend/schema/Transform/Target/Run은 변경하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

새 파이프라인 만들기를 누르면 source type picker와 dataset card selector가 열리는지 확인한다.
type 선택, 전체 보기, 검색, 정렬이 dataset 카드 목록에 반영되는지 확인한다.
dataset 선택 후 Source 카드와 schema preview가 갱신되는지 확인한다.
Transform/Target/Run이 아직 동작하지 않는지 확인한다.
frontend build와 harness validation을 실행하고 결과를 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] source type picker가 있다.
- [x] dataset 카드 목록에서 type 필터/전체 보기/검색/정렬이 가능하다.
- [x] dataset 선택 상태가 Source 카드와 schema preview에 반영된다.
- [x] 실제 source API/connector/backend/schema 변경이 없다.
- [x] Transform/Target/Run 범위가 확장되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
