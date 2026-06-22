# Structure refactor 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Full Decision Option Brief는 작성하지 않음. behavior-preserving refactor이며 high-impact product decision이 아니다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Frontend structure | resource API clients + feature hooks + small render components | 외부 demo UI 적용과 M6~M8 확장 시 fetch/state logic을 보존하면서 화면을 교체하기 쉽게 하기 위해 | user refactor request / 2026-06-22 |
| Transform boundary | move select transform into `backend/app/domain/transforms.py` | M7 transform 확장 시 pipeline service를 비대하게 만들지 않기 위해 | user refactor request / 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| SQLiteMetadataStore split | 아직 기능 압력이 작고 repository 분해 비용이 더 큼 | source connector/run management 확장으로 store 변경이 반복될 때 | M6 또는 M8 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Feature hook split | demo UI가 완전히 다른 state model을 요구하면 | hook API를 유지하거나 adapter hook을 추가 |
| Transform boundary | transform type이 3개 이상으로 늘어나면 | registry 또는 strategy map으로 확장 |
