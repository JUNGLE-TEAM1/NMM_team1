# Source of truth alignment 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/01-product-planning.md` | M3/M4 결정 사항과 남은 열린 질문을 현재 구현 상태로 갱신 | file upload/result storage가 아직 미결처럼 보이는 문제 해결 | 낮음 |
| `docs/02-architecture.md` | `PipelineService` 현재 구현과 future `PipelineRunner` 후보를 분리 | 구현되지 않은 runner가 이미 붙은 것처럼 보이는 문제 해결 | 낮음 |
| `docs/03-interface-reference.md` | milestone 번호와 MVP pipeline endpoint 계약을 현재 구현에 맞춤 | 팀원이 API와 다음 phase 번호를 혼동하지 않게 하기 위함 | 낮음 |
| `docs/07-manual-verification-playbook.md` | 수동 검증 문구를 `select_fields` 기반 pipeline으로 수정 | row filter가 이미 구현된 것처럼 읽히는 문제 해결 | 낮음 |

## Integration Notes / 통합 메모

- Historical workspace reports는 당시 결정을 보존하는 기록이므로 이번 branch에서 고치지 않는다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
