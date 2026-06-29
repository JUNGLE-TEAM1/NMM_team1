# External connection create wizard 계획

## 브랜치

- Branch: `feature/external-connection-create-wizard`
- Workspace: `docs/workflows/feature/external-connection-create-wizard`
- Created: 2026-06-29

## 목표

- 외부 데이터 원천을 AskLake에 연결하기 위한 External Connection 생성 wizard를 추가한다.
- Source Dataset 생성 전에 필요한 "외부 연결 설정" 단계를 별도 시나리오로 보여준다.

## 범위

- 단계: `Connector Type` -> `Configure` -> `Review`.
- connector type 후보: CSV, Kafka, PostgreSQL, MongoDB, REST API, S3.
- Configure 단계는 demo-safe mock field만 제공한다.
  - connection name
  - endpoint/path/topic/table placeholder
  - auth mode 표시 또는 disabled secret field
  - connection scope/owner summary
- Review 단계는 External Connection draft 요약을 보여준다.
- 최종 CTA는 실제 저장을 암시하지 않는 draft wording으로 둔다.

## 범위 제외

- 실제 credential 입력/저장.
- 실제 연결 테스트.
- backend connector 생성 API.
- Source Dataset 생성 wizard 수정.
- Target Dataset 생성 wizard 수정.
- permission, lineage, run history.

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

`feature/external-connection-create-wizard` branch workspace 범위만 구현한다.
데이터셋 생성 선택지 중 External Connection을 선택하면 `Connector Type` -> `Configure` -> `Review` 3단계 wizard로 이동하게 한다.
CSV, Kafka, PostgreSQL, MongoDB, REST API, S3 connector type을 demo 선택지로 제공하고, Configure는 connection name과 endpoint/path/topic/table placeholder 중심의 mock 설정만 제공한다.
credential 저장, 실제 연결 테스트, backend connector API, Source/Target wizard 재작성은 구현하지 않는다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

External Connection 선택 후 connector type, configure, review 단계가 순서대로 보이는지 확인한다.
실제 credential 저장/API 호출을 암시하는 동작이 없는지 확인하고 `quality.md`와 `report.md`에 증거를 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] External Connection wizard가 3단계로 표시된다.
- [x] CSV, Kafka, PostgreSQL, MongoDB, REST API, S3 connector type을 선택할 수 있다.
- [x] Configure에서 demo-safe connection draft를 설정할 수 있다.
- [x] Review에서 External Connection draft가 요약된다.
- [x] 실제 credential/backend 연결은 추가되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
