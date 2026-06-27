# M5 Airflow smoke integration 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | no change | existing architecture can absorb local smoke boundary through interface/manual docs | low |
| `docs/03-interface-reference.md` | document `airflow_result_file` and shared result artifact contract | adapter/DAG handoff is a contract | medium |
| `docs/05-acceptance-scenarios-and-checklist.md` | add M5 Airflow local smoke acceptance | completion must prove real DAG result is consumed | low |
| `docs/06-regression-and-failure-scenarios.md` | add guard against hidden local fallback | prevents false success when Airflow did not run | medium |
| `docs/07-manual-verification-playbook.md` | add local Airflow smoke steps | gives repeatable manual verification path | low |

## Integration Notes / 통합 메모

- Airflow smoke depends on local Docker and port `8080`; use `AIRFLOW_PORT` if the port is occupied.

## Conflicts To Resolve / 해결할 충돌

- none known
