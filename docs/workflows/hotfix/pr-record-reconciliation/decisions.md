# PR record reconciliation Hotfix 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 option brief는 생략했다. 사용자가 원격 보정 기록을 repo에 남기라고 명시했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 원격 보정 기록 방식 | 별도 Hotfix PR로 evidence 기록 | PR metadata 직접 수정은 repo history에 남지 않으므로 하네스 evidence가 필요하다. | 사용자 지시 / 2026-06-27 |
| historical drift 처리 | merged PR은 수정하지 않고 historical drift로만 기록 | 이미 merge된 PR metadata를 사후 수정하면 review history를 혼동시킬 수 있다. | 사용자 프롬프트 / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| #181/#182 merge/finalize | 이번 scope는 metadata 보정 기록이다. | 사람이 특정 PR 마무리를 명시할 때 | 해당 PR workflow |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 원격 보정 기록 | 원격 PR metadata가 다시 drift될 때 | read-only audit 후 별도 reconciliation 기록 |
