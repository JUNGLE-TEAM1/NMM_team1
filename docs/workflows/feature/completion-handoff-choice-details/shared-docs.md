# Completion handoff choice details 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/08-development-workflow.md` | complete + PR-ready 선택지별 진행 절차, 장점, 주의사항, 상태 변경 여부 추가 | 선택지 이름만 보고 사람이 판단해야 하는 문제를 줄이기 위해 | 낮음 |
| `docs/10-next-action-menu.md` | Complete And PR Ready 메뉴 상세 추가 | 완료 후 선택지의 판단 기준을 한 곳에서 찾기 위해 | 낮음 |
| `docs/13-human-command-flow.md` | 완료 branch 질문 응답 예시 보강 | "PR만"과 merge/finalize까지의 차이를 명확히 하기 위해 | 낮음 |
| `scripts/status-workflow.sh` | PR-ready 추천 문구를 선택지별 설명 안내로 변경 | status output은 짧게 유지하면서 설명 의무를 드러내기 위해 | 낮음 |
| `scripts/validate-harness.sh` | 선택지 설명 누락 방지 guard 추가 | 하네스 규칙이 다시 얕아지는 것을 막기 위해 | 중간 |

## Integration Notes / 통합 메모

- status script는 긴 설명을 전부 출력하지 않고, AI가 문서 기준으로 선택지별 절차/장단점을 설명하도록 안내한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
