# Product Health Processing Template Decisions

- Decision status: accepted

## D1. Template API Boundary

- Decision: M3 contract files를 backend에서 읽어 UI-oriented processing template으로 노출한다.
- Reason: Frontend bundle에 repo-root `contracts/`를 직접 포함하지 않고, API/schema boundary로 제품 기능을 시작한다.
- Scope: 조회/저장만 담당한다. 실행은 PR 5에서 다룬다.

## D2. Manual Mode Compatibility

- Decision: 기존 `select_fields` 흐름은 manual mode로 유지한다.
- Reason: 기존 External Connection / Source Dataset / Target Dataset 기본 흐름을 깨지 않기 위함이다.

## D3. Locked Contract Fields

- Decision: risk_score 공식과 final gold schema는 이번 PR에서 read-only contract metadata로 표시한다.
- Reason: 사용자가 편집하는 builder는 PR 3 범위이며, M3 demo contract를 임의 변경하지 않는다.

## Decision Option Briefs / 결정 옵션 브리프

- not needed

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Template API Boundary | Backend template API | Frontend가 repo-root contracts를 직접 bundle하지 않게 한다. | Codex / 2026-06-30 |
| Manual Mode Compatibility | Keep `select_fields` manual mode | 기존 Target Dataset draft 흐름을 깨지 않는다. | Codex / 2026-06-30 |
| Locked Contract Fields | Read-only risk score and gold schema | PR 3 전에는 M3 demo contract를 임의 편집하지 않는다. | Codex / 2026-06-30 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Multi-source role mapping | PR 1은 template review/save만 닫는다. | PR 2 시작 | Product Health PR 2 |
| Builder edit controls | PR 1은 full editor가 아니다. | PR 3 시작 | Product Health PR 3 |
| M2 execution binding | 실행은 M2 runner contract 연결 뒤 다룬다. | PR 5 시작 | Product Health PR 5 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Template API Boundary | contracts path가 runtime에서 안정적으로 resolve되지 않음 | service root discovery 또는 settings injection으로 보강 |
| Manual Mode Compatibility | 기존 `select_fields` draft 저장 회귀 발생 | manual mode payload를 기존 shape로 되돌림 |
