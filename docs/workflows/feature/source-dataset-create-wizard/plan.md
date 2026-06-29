# Source dataset create wizard 계획

## 브랜치

- Branch: `feature/source-dataset-create-wizard`
- Workspace: `docs/workflows/feature/source-dataset-create-wizard`
- Created: 2026-06-29

## 목표

- Source Dataset 생성 시나리오를 3단계 wizard로 만든다.
- XFlow처럼 source type을 먼저 고르고, demo에 필요한 configure/review 흐름을 보여준다.

## 범위

- 단계: `데이터 소스 선택` -> `Configure` -> `Review`.
- source type 후보: CSV, Kafka, PostgreSQL, MongoDB, API, S3.
- source type 선택 후 해당 유형의 demo dataset card 목록으로 이동한다.
- card 목록에서 검색/정렬/유형 필터 또는 전체 보기를 제공한다.
- Configure 단계에는 demo용 dataset name, connection/profile summary, schema preview 또는 sample metadata를 표시한다.
- Review 단계에는 source type, 선택 dataset, configure summary를 보여준다.

## 범위 제외

- 실제 credential 입력/저장.
- 실제 연결 테스트.
- backend connector 생성 API.
- Target Dataset 생성 흐름 변경.
- permission, lineage, schedule, run history.

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

`feature/source-dataset-create-wizard` branch workspace 범위만 구현한다.
Source Dataset 생성 wizard를 `데이터 소스 선택` -> `Configure` -> `Review` 3단계로 추가한다.
CSV, Kafka, PostgreSQL, MongoDB, API, S3 source type을 demo 선택지로 제공하고, 선택 후 해당 유형의 demo dataset card 목록과 검색/정렬/필터/전체 보기 구조를 제공한다.
Configure와 Review는 demo metadata summary 수준으로 구현한다.
실제 credential 저장, 연결 테스트, backend connector API, Target Dataset 흐름 변경은 구현하지 않는다.
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

- [x] Source Dataset wizard가 3단계로 표시된다.
- [x] CSV, Kafka, PostgreSQL, MongoDB, API, S3 source type을 선택할 수 있다.
- [x] 선택한 source type에 맞는 demo dataset card 목록으로 이동한다.
- [x] dataset card 목록에 검색/정렬/유형 필터 또는 전체 보기 구조가 있다.
- [x] Configure와 Review에서 선택 내용이 요약된다.
- [x] 실제 credential/backend 연결은 추가되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
