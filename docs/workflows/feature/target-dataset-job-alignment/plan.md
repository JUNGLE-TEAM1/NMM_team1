# Target dataset job alignment 계획

## 브랜치

- Branch: `feature/target-dataset-job-alignment`
- Workspace: `docs/workflows/feature/target-dataset-job-alignment`
- Created: 2026-06-29

## 목표

- Target Dataset 생성 wizard를 Source Dataset 기반 ETL job definition 생성 흐름으로 정렬한다.
- Source Dataset과 Target Dataset의 책임을 화면 문구와 review summary에서 명확히 분리한다.

## 범위

- 기존 Target Dataset 5단계 구조를 유지한다.
  - Overview
  - Source Dataset 선택
  - Process
  - Scheduling
  - Review
- Source 선택 단계는 등록된 Source Dataset card만 선택하게 표현한다.
- Process 단계는 target dataset을 만들기 위한 처리 규칙으로 표현한다.
- Scheduling 단계는 target dataset 갱신 job schedule로 표현한다.
- Review 단계는 target dataset draft와 ETL job definition 요약을 함께 보여준다.

## 범위 제외

- External Connection 생성/수정.
- Source Dataset 생성 wizard 재작성.
- 실제 ETL 실행, run history, polling.
- cron persistence, backend job API, lineage, permission.
- 새로운 transform engine 구현.

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

`feature/target-dataset-job-alignment` branch workspace 범위만 구현한다.
Target Dataset wizard의 5단계 구조는 유지하되, copy와 review summary를 Source Dataset 기반 target dataset + ETL job definition 생성 흐름으로 정렬한다.
Source 선택 단계는 등록된 Source Dataset을 선택하는 곳으로 표현하고, Process/Scheduling은 target dataset 갱신 job의 처리 규칙과 실행 계획으로 표현한다.
실제 ETL 실행, run history, polling, cron persistence, backend job API, lineage, permission은 구현하지 않는다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

Target Dataset wizard가 Source Dataset 선택 -> Process -> Scheduling -> Review 흐름으로 읽히는지 확인한다.
Review에서 target dataset draft와 ETL job definition이 분리되어 요약되는지 확인하고 `quality.md`와 `report.md`에 증거를 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] Target Dataset wizard의 Source 선택이 등록된 Source Dataset 선택으로 보인다.
- [x] Process와 Scheduling이 target dataset 갱신 job 설정으로 읽힌다.
- [x] Review에서 target dataset draft와 ETL job definition이 함께 요약된다.
- [x] 실제 실행/run history/backend job API는 추가되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
