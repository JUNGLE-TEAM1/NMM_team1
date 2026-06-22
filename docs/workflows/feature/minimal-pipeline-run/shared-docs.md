# Minimal pipeline run 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | pipeline service, local result store adapter, future runner adapter 위치를 M5/M7 전에 반영 후보로 둔다. | M4 구현으로 실제 layer 경계가 생겼다. | 낮음 |
| `docs/03-interface-reference.md` | 현재 문서의 MVP pipeline contract와 구현이 맞는다. 필요 시 endpoint 목록을 더 구체화한다. | 팀원이 API를 빠르게 찾을 수 있게 하기 위함. | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | M4 완료 뒤 pipeline success/failed checklist를 체크하거나 세분화한다. | MVP acceptance 추적용. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | source file missing -> failed run 기록 회귀 시나리오를 추가 후보로 둔다. | 이번 실패 path를 보호하기 위함. | 낮음 |
| `docs/07-manual-verification-playbook.md` | UI에서 source 등록 후 pipeline 실행 확인 절차를 추가 후보로 둔다. | 팀원 수동 데모 준비용. | 낮음 |

## Integration Notes / 통합 메모

- 이번 branch에서는 공유 Source of Truth를 직접 수정하지 않고 workspace 기록과 코드/테스트에 집중했다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
