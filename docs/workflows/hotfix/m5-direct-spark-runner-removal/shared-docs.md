# M5 direct spark_runner 제거 Hotfix shared docs

## Source Of Truth Impact

- Status: applied

## Proposed Source Of Truth Changes

| File | Proposed Change | Reason | Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | M5 workflow run request executor 허용값을 `local_runner`/`airflow`로 정리 | Interface contract 변경 | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | Airflow/local runner 결과와 M2 Spark runtime smoke를 분리해 표현 | Acceptance 문구 drift 방지 | low |
| `docs/07-manual-verification-playbook.md` | direct `spark_runner` 확인 문구 제거 | Manual verification 혼동 방지 | low |

## Deferred Source Of Truth Changes

| File | Deferred Reason | Revisit Trigger |
| --- | --- | --- |
| 없음 | n/a | n/a |

## Contract Fixtures

- `contracts/execution_result.sample.json`
- `contracts/workflow_definition.sample.json`
- `contracts/runtime_config.sample.json`
