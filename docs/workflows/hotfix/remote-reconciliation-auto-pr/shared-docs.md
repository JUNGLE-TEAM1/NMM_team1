# Remote reconciliation auto PR 공유 문서 변경 제안

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/08-development-workflow.md` | remote operations reconciliation auto PR policy 추가 | 원격 상태 보정과 하네스 재현 변경이 분리되지 않도록 함 | low |
| `docs/10-next-action-menu.md` | Small Change / PR Ready 메뉴에 remote reconciliation note 추가 | 다음 행동 추천이 정책을 설명해야 함 | low |
| `docs/11-git-sync-policy.md` | 자동 PR 조건에 remote operations reconciliation 추가 | Git/PR lifecycle policy owns auto PR boundary | low |
| `docs/04-development-guide.md` | PR checklist와 운영 원칙 보강 | 개발 운영 체크리스트가 PR 후보를 놓치지 않게 함 | low |
| `scripts/status-workflow.sh` | remote reconciliation evidence 감지와 자동 PR 추천 문구 추가 | status summary가 다음 행동을 올바르게 안내해야 함 | medium |
| `scripts/test-harness.sh` | remote reconciliation 자동 PR 추천 regression 추가 | 하네스 추천 회귀 방지 | medium |

## Integration Notes / 통합 메모

- Remote operations reconciliation은 `report.md`, `quality.md`, `notes.md`, `sync.md`, `shared-docs.md` 중 하나에 `Remote operations reconciliation` 또는 `원격 운영 상태` evidence가 있을 때 감지한다.
- 자동 범위는 commit, branch push, PR 생성까지이며 merge/finalize/cleanup/deploy는 기존처럼 사람 명시 지시가 필요하다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
