# M2 Workflow runner 연동 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | Week 2 workflow executor 허용값에 `spark_runner`를 추가하고, direct `spark_runner`가 Airflow DAG 내부 실행이 아님을 명시 | API request contract가 `local_runner`/`airflow`에서 `spark_runner`까지 확장됨 | Low; additive contract |
| `contracts/execution_result.sample.json` | `allowed_executors`에 `airflow`, `local_runner`, `spark_runner` 기록 | M1/M5/M6가 `ExecutionResult.executor` 허용값을 같은 기준으로 해석해야 함 | Low; additive field |
| `contracts/workflow_definition.sample.json` | runner direct executor로 `spark_runner`와 선택 조건 기록 | M5가 M2 `Week2SparkRunner`를 직접 호출하는 경계를 표시 | Low; additive field |
| `docs/05-acceptance-scenarios-and-checklist.md` | Week 2 runner 호환 결과 문구에 `spark runner` 추가 | acceptance가 새 executor contract를 반영해야 함 | Low; wording only |
| `docs/07-manual-verification-playbook.md` | Week 2 fixture 확인 항목에 direct `spark_runner` 추가 | 수동 검증자가 `spark_runner` 경계를 확인할 수 있어야 함 | Low; wording only |

## Integration Notes / 통합 메모

- `docs/02-architecture.md`는 이번 PR에서 수정하지 않는다. 구조 변화는 기존 M2 runtime/M5 workflow 경계에 executor 선택지를 추가하는 수준이다.
- `docs/06-regression-and-failure-scenarios.md`는 기존 Week 2 fixture contract regression 항목으로 충분하다고 판단해 수정하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
