# 데이터 통합 Source Step 계획

## 브랜치

- Branch: `feature/data-integration-source-step`
- Workspace: `docs/workflows/feature/data-integration-source-step`
- Created: 2026-06-29

## 선행 조건

- `feature/data-integration-flow-skeleton` 완료 또는 사람이 4단계 flow skeleton 방향을 확인한다.

## 목표

- pipeline 생성의 첫 단계로 source를 선택할 수 있게 한다.
- 선택된 source가 flow skeleton의 Source 카드 상태에 반영되게 한다.

## 범위

- 데이터 통합 화면의 Source step만 확장한다.
- 기존 source dataset API 또는 현재 화면에서 사용할 수 있는 source/dataset 상태를 우선 사용한다.
- 실제 API 연결이 현재 구조상 부담되면 demo-safe placeholder를 쓰되, 후속 연결 TODO를 명확히 남긴다.
- `새 파이프라인 만들기` 클릭 시 Source 시작 모달을 연다.
- Source 시작 모달에는 기존 source dataset 선택과 새 source 연결 진입점을 둔다.
- 새 source 연결은 이번 Phase에서 실제 connector를 만들지 않고, 연결 화면/후속 연결 위치로 이어질 자리임을 명확히 표시한다.
- source 선택 후 schema preview 자리만 표시한다.

## 범위 제외

- Transform 설정 구현.
- Target 설정 구현.
- Run 실행 구현.
- 새 source connector 구현.
- backend schema 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/01-product-planning.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `frontend/src/api/sourceApi.js`
- `frontend/src/api/catalogApi.js`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/01-product-planning.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/15-context-budget-rule.md

`feature/data-integration-source-step` branch workspace 범위만 구현한다.
데이터 통합 flow의 Source 단계만 선택 가능한 형태로 확장한다.
기존 source dataset API 또는 현재 dataset 상태를 우선 사용하고, 부담이 크면 demo-safe placeholder로 시작하되 후속 연결 TODO를 남긴다.
`새 파이프라인 만들기` 버튼은 Source 시작 모달을 열고, 모달에서 기존 source dataset 선택 또는 새 source 연결 진입점을 보여준다.
source 선택 결과는 Source 카드 상태에 반영한다.
schema preview는 자리만 만들고 실제 보정/transform은 후속 Phase로 남긴다.
Transform, Target, Run 동작은 구현하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

source를 선택하면 Source 카드 상태가 바뀌는지 확인한다.
source가 없을 때 empty state가 명확한지 확인한다.
후속 Transform/Target/Run이 아직 비활성 또는 안내 상태인지 확인한다.
검증 결과와 남은 미연결 범위를 `quality.md`와 report에 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] Source step에서 source를 선택할 수 있다.
- [x] `새 파이프라인 만들기` 클릭 시 Source 시작 모달이 열린다.
- [x] 선택 상태가 flow skeleton Source 카드에 반영된다.
- [x] source 없음 상태와 schema preview 자리가 명확하다.
- [x] Transform/Target/Run 범위가 확장되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
