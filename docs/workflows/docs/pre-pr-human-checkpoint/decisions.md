# Decisions

- Decision status: accepted

## Decision Option Briefs

- Not needed. 사용자가 `Pre-PR Human Checkpoint` 규칙 추가 방향을 명시 승인했다.

## Accepted Decisions

| Decision | Selected option | Reason |
| --- | --- | --- |
| Complete/PR-ready handoff | `Pre-PR Human Checkpoint` required | PR을 만들지 않는 것만으로는 다음 행동이 끊기므로, 완료 직전 선택지를 물어야 한다. |
| Automatic PR creation | 제거 | `AGENTS.md`의 사람 확인 원칙과 충돌한다. |
| Harness fixture update | skipped | 문서 규칙 정렬이며 validation script behavior는 바꾸지 않았다. 기존 harness test와 strict validation으로 회귀를 확인한다. |

## Deferred Decisions

| Decision | Reason | Revisit trigger | Target branch/phase |
| --- | --- | --- | --- |
| `scripts/validate-harness.sh`로 Pre-PR checkpoint 필드 강제 | 현재 범위는 문서 규칙 정렬이며 workspace schema/script 변경은 별도 fixture 설계가 필요하다. | agent가 다시 PR/handoff 선택 질문을 누락하거나 workspace evidence가 반복적으로 빠질 때 | `docs/pre-pr-checkpoint-validation` |

## Revisit / Rollback Conditions

- PR-ready workspace에서 사람이 선택하기 전 push/PR/merge가 발생하면 규칙을 script validation까지 승격한다.
- `PR 진행`의 승인 범위가 너무 넓다고 판단되면 `PR 생성`, `merge/finalize`, `cleanup`을 별도 checkpoint로 분리한다.
