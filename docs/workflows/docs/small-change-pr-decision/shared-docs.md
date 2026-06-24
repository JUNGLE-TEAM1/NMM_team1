# Small change PR decision 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/08-development-workflow.md` | 작은 변경 완료와 PR 전 파일 분리 규칙 추가 | 작은 팀 공유 산출물도 PR 후보임을 명확히 함 | Low |
| `docs/09-collaboration-agreement.md` | `Small Change PR Agreement` 추가 | 작은 변경의 PR/로컬 보류 판단 기준을 공유 규칙으로 둠 | Low |
| `docs/10-next-action-menu.md` | `Small Change Completion Decision` 메뉴 추가 | 작은 변경 완료 후 선택지를 명확히 함 | Low |
| `docs/13-human-command-flow.md` | 작은 변경 PR 판단 명령 예시와 AI 책임 추가 | 사람이 짧은 명령으로 포함/제외 파일과 PR 여부를 조정하게 함 | Low |
| `docs/reports/README.md` | `small-change-pr-decision.md` report index 추가 | 최신 evidence 탐색을 쉽게 함 | Low |

## Integration Notes / 통합 메모

- 제품 기능과 runtime code는 변경하지 않는다.
- `scripts/start-workflow.sh`의 dirty checkpoint 동작은 이번 scope에서 수정하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- none known
