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
