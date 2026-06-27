# M5 Airflow integration option guide 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 지금은 변경 없음. 실제 Airflow compose/DAG 구현 시 Airflow runtime boundary를 반영할 수 있다. | 이번 작업은 project context option guide만 추가한다. | 낮음 |
| `docs/03-interface-reference.md` | 지금은 변경 없음. 실제 구현 시 `airflow_result.json` 또는 XCom result contract를 Source of Truth로 반영해야 한다. | result handoff 방식은 backend adapter와 DAG 사이 계약이 된다. | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 지금은 변경 없음. 실제 Airflow smoke 구현 시 executor=`airflow` 성공 기준을 추가할 수 있다. | 이번 작업은 구현 전 선택지 정리다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 지금은 변경 없음. 실제 구현 시 Airflow failure/fallback 숨김 방지 guard를 추가할 수 있다. | fallback이 Airflow 실패를 숨길 수 있다. | 중간 |
| `docs/07-manual-verification-playbook.md` | 지금은 변경 없음. 실제 구현 시 Airflow UI/DAG run/Catalog 저장 확인 절차를 추가할 수 있다. | smoke 검증 경로가 필요하다. | 중간 |

## Integration Notes / 통합 메모

- 이번 branch는 shared Source of Truth를 직접 바꾸지 않고 `docs/project-context/`의 ver2 판단 문서를 추가한다.
- 다음 구현 branch에서는 `docs/03`, `docs/06`, `docs/07` 반영 여부를 다시 판단한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
