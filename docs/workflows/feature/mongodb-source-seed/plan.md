# MongoDB Source Dataset seed 계획

## 브랜치

- Branch: `feature/mongodb-source-seed`
- Workspace: `docs/workflows/feature/mongodb-source-seed`
- Created: 2026-06-30

## 목표

- 로컬 Docker MongoDB를 실행하고, 기존 AskLake demo JSONL 데이터 일부를 collection에 적재한다.
- AskLake backend가 실제 MongoDB collection schema/sample preview를 읽어 External Connection과 Source Dataset metadata로 저장할 수 있게 한다.

## 범위

- MongoDB External Connection create/list/read/test API support.
- MongoDB collection schema preview: sample documents 기반 top-level field/type preview와 count estimate.
- repo-local seed script와 별도 Docker Compose 파일.
- `data/asklakemart_chimera_raw_test`의 작은 JSONL 데이터를 MongoDB에 적재.
- API smoke로 External Connection, schema preview, Source Dataset metadata 저장 확인.

## 범위 제외

- Target Dataset run, CatalogMetadata publish, AI Query 연결.
- production credential vault, TLS/SCRAM 운영 설정, cloud MongoDB/Atlas 연결.
- nested document flattening, full collection profiling, CDC/stream ingest.
- 기존 PostgreSQL 연결 동작 변경.

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

- not needed

큰 Phase를 내부 단계로 나누는 경우 아래 양식을 사용한다. 작은 Phase는 이 섹션을 `not needed`로 둔다.

### Step N - [STEP_NAME]

#### 목표

- [STEP_GOAL]

#### 범위

- [STEP_SCOPE]

#### 범위 제외

- [STEP_OUT_OF_SCOPE]

#### 구현 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[IMPLEMENTATION_REQUEST]
```

#### 검증 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[VERIFICATION_REQUEST]
```

#### 완료 기준

- [ ] [STEP_COMPLETION_CRITERION]

## 완료 기준

- [ ] MongoDB container가 로컬에서 실행된다.
- [ ] seed script가 기존 demo 데이터 일부를 MongoDB collection에 적재한다.
- [ ] `/api/external-connections/test`가 `connection_type=mongodb`로 collection schema preview를 반환한다.
- [ ] `/api/external-connections`와 `/api/source-datasets`가 MongoDB metadata를 저장/조회한다.
- [ ] focused backend tests와 API smoke 결과를 `quality.md`에 기록한다.
- [ ] Acceptance, Regression/failure scenario, Manual verification 결과를 기록한다.
- [ ] Report 업데이트
