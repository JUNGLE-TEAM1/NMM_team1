# 데이터 통합 Flow Skeleton 계획

## 브랜치

- Branch: `feature/data-integration-flow-skeleton`
- Workspace: `docs/workflows/feature/data-integration-flow-skeleton`
- Created: 2026-06-29

## 선행 조건

- `feature/data-integration-screen-reset` 완료 또는 사람이 그에 준하는 화면 정리 상태를 확인한다.

## 목표

- 데이터 통합 화면 안에 XFlow 참고 기반의 최소 pipeline 생성 흐름을 표시한다.
- `Source -> Transform -> Target -> Run` 4단계가 카드 또는 stepper 형태로 보이게 하되, 아직 실제 입력 동작은 붙이지 않는다.

## 범위

- 데이터 통합 화면만 수정한다.
- 4단계는 각각 짧은 설명과 상태 label을 가진다. 예: `선택 대기`, `설정 대기`, `실행 대기`.
- `새 파이프라인 만들기` 진입점은 skeleton 영역으로 시선을 유도한다.
- XFlow 코드는 복사하지 않고 UX 구조만 참고한다.

## 범위 제외

- Source 실제 선택.
- 컬럼 체크박스 또는 transform 설정.
- target name 입력.
- run API 연결.
- canvas/drag-and-drop 구현.
- backend/API/schema 변경.

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
- XFlow reference: `/Users/tail1/Documents/데이터 파이프라인/xflow/frontend/src/pages/etl/etl_main.jsx`
- XFlow reference: `/Users/tail1/Documents/데이터 파이프라인/xflow/frontend/src/pages/etl/etl_job.jsx`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/01-product-planning.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/15-context-budget-rule.md

`feature/data-integration-flow-skeleton` branch workspace 범위만 구현한다.
데이터 통합 화면에 `Source -> Transform -> Target -> Run` 4단계 flow skeleton을 카드 또는 stepper 형태로 추가한다.
각 단계는 짧은 설명과 상태 label만 가진다.
실제 선택, 입력, 실행, API 연결은 구현하지 않는다.
XFlow는 read-only reference로만 보고 코드를 복사하지 않는다.
desktop/mobile에서 텍스트가 겹치지 않도록 확인한다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

화면만 보고 pipeline 생성 흐름이 `Source -> Transform -> Target -> Run`으로 이해되는지 확인한다.
desktop/mobile에서 카드 텍스트가 겹치지 않는지 확인한다.
가능한 frontend 검증을 실행하고 `quality.md`와 report에 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] 4단계 flow skeleton이 데이터 통합 화면에 표시된다.
- [x] 각 단계 상태 label이 있고 아직 실제 동작을 약속하지 않는다.
- [x] `새 파이프라인 만들기` 진입점과 flow skeleton의 관계가 명확하다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
