# Multi-source Target Dataset 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed: 후보 비교가 필요한 고영향 선택은 없었다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Single-source field compatibility | `source_dataset_id`를 제거하지 않고 primary/backward-compatible reference로 유지하며 `source_mappings[]`를 additive로 추가 | 기존 Target Dataset draft/run handoff와 External Connection/Source Dataset 흐름을 깨지 않기 위해 | user request PR 2 / 2026-06-30 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| M2 multi-source execution | 이번 PR은 metadata/UI mapping까지만 닫고 runner 실행은 PR 5로 보류 | 사용자 지시상 PR 2 범위는 multi-source Target Dataset metadata이고 실행은 후속 | PR 5 M2 Execution 연결 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `source_mappings[]` additive schema | 기존 single-source 클라이언트가 깨지는 경우 | field optional/default 유지 여부 재검토 |
