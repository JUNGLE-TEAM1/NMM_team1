# Human-facing big dataset clarity 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Decision Option Brief는 사용하지 않았다. 이번 작업은 이미 승인된 제품 방향을 사람이 보는 문서에 더 명확히 반영하는 문구 보강이며, 새 고영향 선택이 아니다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 사람용 문서 big dataset clarity | README/온보딩/project context 문구를 대용량/복합 데이터셋을 신뢰 가능한 분석 자산으로 만드는 흐름 중심으로 보강 | 사용자가 같은 느낌을 사람용 문서에 적용하라고 지시했고, 새 API/schema/runtime 범위 변경이 아니기 때문 | 사용자 지시 / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 없음 | 없음 | 없음 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 문구가 production-grade distributed processing 도입으로 오해됨 | 후속 문서에서 `local/container` Demo Tenant 범위와 후속 도입 후보 표현을 유지한다. |
