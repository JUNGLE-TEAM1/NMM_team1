# Dataset creation IA reframe 계획

## 브랜치

- Branch: `feature/dataset-creation-ia-reframe`
- Workspace: `docs/workflows/feature/dataset-creation-ia-reframe`
- Created: 2026-06-29

## 목표

- 데이터셋 생성의 최상위 정보 구조를 `External Connection`, `Source Dataset`, `Target Dataset` 3개로 재정의한다.
- Source Dataset 생성이 이미 등록된 데이터셋을 다시 등록하는 것처럼 보이는 혼선을 먼저 제거한다.

## 범위

- `데이터셋 생성` 선택 모달을 3개 카드로 바꾼다.
- 카드 역할을 다음처럼 명확히 표현한다.
  - External Connection: CSV, Kafka, DB, API, S3 같은 외부 원천 연결 설정
  - Source Dataset: 등록된 External Connection에서 raw/source dataset 생성
  - Target Dataset: Source Dataset을 가공해 target dataset과 ETL job definition 생성
- 기존 Source/Target 상세 wizard는 이 Phase에서 대규모 재작성하지 않는다.
- 기존 D-* 구현의 잘못된 문구가 첫 화면에서 확산되지 않도록 entry copy를 우선 정리한다.

## 범위 제외

- External Connection 상세 wizard 구현.
- Source Dataset 상세 wizard 재작성.
- Target Dataset process/schedule logic 변경.
- 실제 connector API, credential 저장, schema/backend 변경.
- PR merge, branch cleanup, issue close.

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

`feature/dataset-creation-ia-reframe` branch workspace 범위만 구현한다.
데이터셋 생성 entry를 External Connection / Source Dataset / Target Dataset 3개 선택지로 재정의한다.
External Connection은 외부 원천 연결 설정, Source Dataset은 등록된 연결에서 raw/source dataset 생성, Target Dataset은 Source Dataset 기반 target dataset + ETL job definition 생성으로 설명한다.
이 Phase에서는 상세 wizard를 새로 만들거나 backend/API/credential 저장을 추가하지 않는다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

`/dataset` 화면에서 데이터셋 생성 버튼을 누르면 3개 생성 유형이 보이는지 확인한다.
각 카드 설명이 External Connection, Source Dataset, Target Dataset 역할을 혼동 없이 구분하는지 확인한다.
Source/Target 기존 wizard가 깨지지 않았는지 smoke 확인하고 `quality.md`와 `report.md`에 증거를 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] 데이터셋 생성 선택지가 3개로 표시된다.
- [x] External Connection, Source Dataset, Target Dataset의 역할 copy가 분리되어 있다.
- [x] Source Dataset이 외부 source type/card를 직접 고르는 것으로 첫 화면에서 보이지 않는다.
- [x] 상세 External Connection wizard는 아직 구현되지 않았다.
- [x] 기존 Source/Target 진입 smoke가 깨지지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
