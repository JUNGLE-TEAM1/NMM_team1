# Demo polish 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `README.md` | MVP demo path와 현재 product code 상태를 현재 구현에 맞게 갱신 | 팀원이 바로 실행 경로를 찾을 수 있어야 한다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | MVP demo script 연결 추가 | M5 release/demo rehearsal 기준을 수동 검증 문서로 연결한다. | 낮음 |
| `docs/manual-verification/07-mvp-demo-script.md` | 3분 golden path와 실패 경로 문서 추가 | 팀원이 같은 순서로 demo를 재현할 수 있어야 한다. | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 직접 변경 없음. M5 report에서 release/submission gate 충족 증거를 기록 | checklist 자체는 장기 추적 문서라 branch별 체크는 workspace에 둔다. | 낮음 |

## Integration Notes / 통합 메모

- Same-origin `/api` proxy는 local Docker demo 기준이다. 실제 deploy ingress가 생기면 deploy branch에서 다시 확인한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
