# M2 Docker Spark Taxi evidence 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | no change | 이번 branch는 기존 M2 runner/runtime 증거 경로에 Docker 실행 방식을 추가할 뿐 architecture boundary를 새로 바꾸지 않는다. | low |
| `docs/03-interface-reference.md` | Taxi evidence에 Docker Spark standalone mode를 추가한다. | Docker Spark cluster execution이 더 이상 전부 later phase가 아니므로 contract reference를 맞춘다. | low |
| `docs/05-acceptance-scenarios-and-checklist.md` |  |  |  |
| `docs/06-regression-and-failure-scenarios.md` |  |  |  |
| `docs/07-manual-verification-playbook.md` | Docker Spark small/5GB smoke 명령을 추가한다. | 사람이 같은 증거를 재실행할 수 있어야 한다. | low |

## Integration Notes / 통합 메모

- 이 branch는 `feature/m2-taxi-5gb-local-evidence`의 Taxi Spark runner를 전제로 한다. 해당 branch가 main에 먼저 들어간 뒤 이 branch를 main 기준으로 정리한다.

## Conflicts To Resolve / 해결할 충돌

- 현재 알려진 문서 충돌은 없다.
