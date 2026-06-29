# M2 Airflow SparkRunner handoff 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `contracts/runtime_config.sample.json` | `airflow_sparkrunner_handoff` profile 추가 | M5 Airflow DAG task가 M2 runner CLI를 호출할 때 쓸 표준 입력과 artifact 위치를 공유하기 위해 | 낮음: additive profile |
| `docs/03-interface-reference.md` | M2 Airflow SparkRunner handoff CLI와 artifact shape 기록 | `Week2AirflowAdapter`가 소비하는 `week2_result` shape와 M2 CLI 경계를 명확히 하기 위해 | 낮음: 기존 계약 유지 |
| `docs/07-manual-verification-playbook.md` | M2 handoff artifact 사전 점검 명령 추가 | real Airflow E2E 전에 M2 artifact만 독립 검증할 수 있게 하기 위해 | 낮음 |

## Integration Notes / 통합 메모

- M5는 Airflow DAG task에서 CLI를 subprocess로 호출하거나 같은 명령을 Docker task에 넣으면 된다.
- CLI가 쓰는 artifact는 기존 M5 adapter가 이미 읽는 shared result artifact와 같은 구조다.
- Airflow service, DAG polling, Catalog update는 M5 소유로 유지한다.

## Conflicts To Resolve / 해결할 충돌

- 현재 없음.
