# Source dataset from connection wizard 계획

## 브랜치

- Branch: `feature/source-dataset-from-connection-wizard`
- Workspace: `docs/workflows/feature/source-dataset-from-connection-wizard`
- Created: 2026-06-29

## 목표

- Source Dataset 생성 wizard를 "이미 등록된 External Connection에서 raw/source dataset을 만든다"는 구조로 보정한다.
- 기존처럼 CSV/Kafka source type 또는 dataset card를 직접 고르는 혼선을 제거한다.

## 범위

- 단계: `Connection 선택` -> `Raw Dataset 설정` -> `Review`.
- Connection 선택은 등록된 External Connection demo card 목록을 사용한다.
- Raw Dataset 설정은 connection 유형별 원천 범위를 demo로 표현한다.
  - CSV/S3: file path 또는 prefix
  - Kafka: topic
  - PostgreSQL/MongoDB: table 또는 collection
  - REST API: endpoint/resource
- schema preview는 raw/source dataset 미리보기로 표현한다.
- Review는 Source Dataset 이름, 선택한 External Connection, raw location/source scope, schema preview를 요약한다.

## 범위 제외

- External Connection 생성 wizard 신규 구현.
- Target Dataset process/schedule 변경.
- 실제 ingest job 실행.
- 실제 raw table 생성, metadata persistence, backend API.
- credential, permission, lineage, run history.

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

`feature/source-dataset-from-connection-wizard` branch workspace 범위만 구현한다.
Source Dataset 생성 wizard를 `Connection 선택` -> `Raw Dataset 설정` -> `Review` 3단계로 보정한다.
선택 대상은 이미 등록된 Source Dataset이 아니라 External Connection demo card여야 한다.
Raw Dataset 설정은 connection 유형별 file/path/topic/table/collection/endpoint 범위와 Source Dataset 이름, schema preview를 demo-safe 수준으로 보여준다.
실제 ingest job, raw table 생성, metadata persistence, backend API, Target Dataset 변경은 구현하지 않는다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

Source Dataset 생성에서 External Connection demo card를 선택한 뒤 raw dataset 설정과 review로 이동하는지 확인한다.
이미 등록된 Source Dataset을 다시 등록하는 것처럼 보이는 copy/card가 남아 있지 않은지 확인하고 `quality.md`와 `report.md`에 증거를 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] Source Dataset wizard가 Connection 선택 -> Raw Dataset 설정 -> Review로 표시된다.
- [x] 선택 대상이 External Connection demo card로 보인다.
- [x] raw/source dataset 이름과 원천 범위를 설정할 수 있다.
- [x] schema preview가 raw/source dataset 미리보기로 표현된다.
- [x] 실제 ingest/backend 저장은 추가되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
