# Source catalog 계획

## 브랜치

- Branch: `feature/source-catalog`
- Workspace: `docs/workflows/feature/source-catalog`
- Created: 2026-06-22

## 목표

- M3 범위인 CSV/local file source 등록, SQLite-backed `MetadataStore`, source/catalog list/detail API, frontend catalog list/detail 화면을 구현한다.

## 범위

- backend 내부 `MetadataStore` interface와 `SQLiteMetadataStore` 구현.
- sample CSV 기반 source 등록, schema/row count/sample rows 추론.
- `POST /api/sources`, `GET /api/sources`, `GET /api/sources/{source_id}`.
- `GET /api/catalog/datasets`, `GET /api/catalog/datasets/{dataset_id}`.
- frontend에서 source 등록 form, catalog list, catalog detail 표시.
- Docker/CI smoke가 M3 API와 frontend asset build를 검증하도록 유지.

## 범위 제외

- file upload UI.
- PostgreSQL/MongoDB store 구현.
- pipeline execution, transform, run history.
- catalog search/filter 고도화.
- AWS deploy/resource 생성.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
```

## 내부 단계별 프롬프트

M3는 backend store/API와 frontend 화면이 함께 바뀌므로 내부 단계로 나눠 진행한다.

큰 Phase를 내부 단계로 나누는 경우 아래 양식을 사용한다. 작은 Phase는 이 섹션을 `not needed`로 둔다.

### Step 1 - MetadataStore And CSV Inspection

#### 목표

- SQLite-backed `MetadataStore`와 CSV schema/sample 추론을 만든다.

#### 범위

- backend store interface, SQLite implementation, CSV inspector, tests, sample CSV

#### 범위 제외

- frontend UI, pipeline execution, alternative store implementations

#### 구현 프롬프트

```text
@AGENTS.md @docs/02-architecture.md @docs/03-interface-reference.md @docs/12-quality-gates.md

`MetadataStore` 경계를 만들고 SQLite 구현체를 추가한다. CSV/local file을 읽어 schema, row_count, sample rows를 추론한다. API id는 string UUID를 사용한다.
```

#### 검증 프롬프트

```text
@AGENTS.md @docs/03-interface-reference.md @docs/12-quality-gates.md

backend focused tests로 CSV 등록 성공과 missing file 실패를 확인한다.
```

#### 완료 기준

- [ ] SQLite store와 CSV inspector test가 통과한다.

### Step 2 - Source/Catalog API

#### 목표

- M3 source/catalog API 계약을 FastAPI에 연결한다.

#### 범위

- `POST /api/sources`, `GET /api/sources`, `GET /api/sources/{source_id}`, `GET /api/catalog/datasets`, `GET /api/catalog/datasets/{dataset_id}`

#### 범위 제외

- authentication, pagination/search/filter, pipeline/run API

#### 구현 프롬프트

```text
@AGENTS.md @docs/03-interface-reference.md

M3 API contract에 맞춰 CSV source 등록과 catalog list/detail endpoint를 구현한다. 없는 file path는 4xx validation error로 반환하고 ready dataset으로 저장하지 않는다.
```

#### 검증 프롬프트

```text
@AGENTS.md @docs/12-quality-gates.md

FastAPI TestClient로 source create/list/detail과 catalog list/detail, missing file error를 검증한다.
```

#### 완료 기준

- [ ] M3 API contract tests가 통과한다.

### Step 3 - Frontend Catalog Experience

#### 목표

- 첫 화면에서 CSV source 등록과 catalog 확인이 가능하게 한다.

#### 범위

- React app shell, source form, catalog list/detail, error state

#### 범위 제외

- upload widget, visual pipeline builder, transform/run UI

#### 구현 프롬프트

```text
@AGENTS.md @docs/03-interface-reference.md

frontend를 M3 작업 화면으로 확장한다. 사용자가 sample CSV path를 등록하고 catalog list/detail에서 schema, row count, sample rows, status를 확인할 수 있게 한다.
```

#### 검증 프롬프트

```text
@AGENTS.md @docs/12-quality-gates.md

frontend build와 container smoke를 실행하고 결과를 `quality.md`에 기록한다.
```

#### 완료 기준

- [ ] frontend build와 container smoke가 통과한다.

## 완료 기준

- [ ] 범위 완료
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
