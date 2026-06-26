# Week2 data path scope clarity 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 큰 구조 변경 없이 기존 ver2 문서의 데이터 경로 표현을 명확히 하는 결정이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Week2 data path scope | 세 데이터 경로 모두 구현, AI Query/분석 대표 경로는 Amazon Reviews | Taxi/Kafka를 선택 사항으로 낮추지 않으면서도 M6 분석 범위를 지금 당장 세 데이터셋 전체로 넓히지 않기 위해 | user discussion / 2026-06-26 |
| Synthetic companion dataset | 후속 리서치로 분리 | 공통 entity key 없는 데이터셋을 억지로 결합하면 분석 의미가 약해지고, 현재 기본 구현 범위를 흔들 수 있기 때문 | user discussion / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md`, `contracts/*.sample.json` 반영 | 이번 변경은 project-context scope clarification이며 실제 API/schema 계약 변경이 아님 | runner/interface 구현 계약이 코드에서 확정될 때 | follow-up interface/contracts Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Synthetic companion dataset | 팀이 Week2 기본 처리/evidence 경로를 닫은 뒤 multi-dataset 분석까지 발표 범위에 포함하기로 결정할 때 | 별도 research/design Phase를 시작한다. |
