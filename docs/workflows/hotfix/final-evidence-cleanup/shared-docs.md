# Final evidence cleanup 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/workflows/docs/system-guardrail-application/sync.md` | PR #136 merge/issue close/Project Done/remote branch cleanup 상태 반영 | workspace evidence가 원격 완료 상태와 일치해야 한다. | low |
| `docs/workflows/docs/system-guardrail-application/report.md` | PR #136 완료 상태와 남은 실제 위험만 반영 | stale handoff 문구 제거 | low |
| `docs/workflows/docs/system-guardrail-application/next-actions.md` | PR #136 workspace를 완료 상태로 갱신 | 다음 행동 안내 정합성 복구 | low |
| `docs/workflows/docs/pr-risk-warning/sync.md` | PR #138 merge/issue close/Project Done/remote branch cleanup 상태 반영 | workspace evidence가 원격 완료 상태와 일치해야 한다. | low |
| `docs/workflows/docs/pr-risk-warning/report.md` | PR #138 완료 상태와 남은 실제 위험만 반영 | stale handoff 문구 제거 | low |
| `docs/workflows/docs/pr-risk-warning/next-actions.md` | PR #138 workspace를 완료 상태로 갱신 | 다음 행동 안내 정합성 복구 | low |

## Integration Notes / 통합 메모

- 기능 코드와 guardrail 동작은 변경하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
