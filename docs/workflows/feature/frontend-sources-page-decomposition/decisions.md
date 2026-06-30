# Frontend SourcesPage decomposition 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted-lightweight

## Decision Option Briefs / 결정 옵션 브리프

- 고영향 제품/계약 선택은 없었다. 파일 boundary refactor이며 API/data/schema/external dependency 변경이 없어서 간단 결정 기록으로 처리했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| `SourcesPage` 분리 단위 | `features/datasets/SourcesPage.jsx` 단일 feature boundary로 우선 이동 | `App.jsx`를 즉시 줄이고 route shell과 dataset workspace 구현을 분리한다. 내부 hook/view split은 다음 Phase가 더 안전하다. | 사용자 "전부 진행하세요" 지시와 Phase 2 scope, 2026-07-01 |
| formatter 위치 | `frontend/src/app/formatters.js` | dataset feature와 남은 app pages가 함께 쓰는 기존 formatter를 중복 없이 공유한다. | Phase 2 scope, 2026-07-01 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `SourcesPage` 내부 hook/view/modal 추가 분해 | 이번 Phase에서 한 번에 나누면 behavior-preserving 검증 범위가 커진다. | `SourcesPage.jsx`가 여전히 5526 lines로 크기 때문에 다음 refactor Phase 시작 시 | 후속 `frontend-dataset-feature-internal-split` 후보 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `SourcesPage` 단일 feature boundary | dataset route smoke 또는 build가 실패하거나 App shell과 feature boundary 순환 의존이 생김 | `App.jsx` import 연결과 `SourcesPage.jsx` import 누락을 우선 확인하고 필요하면 이동 범위를 줄인다. |
