# M2 RuntimeConfig SparkRunner smoke 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `contracts/runtime_config.sample.json` | `spark_runner_smoke` 최소 fixture 추가 | M2 runner smoke가 받는 `input_format`, `input_path`, `output_format`, `output_root`, result fields를 팀이 같은 이름으로 보게 하기 위해 | low |
| `docs/03-interface-reference.md` | 이번 PR에서는 변경하지 않음 | M5 runner selection/API 연결 전까지 공식 interface 문서를 넓히면 drift 위험이 있다 | low |

## Integration Notes / 통합 메모

- 이번 변경은 code runner smoke와 contract sample 보강이다. `Week2WorkflowService`의 executor API는 아직 `local_runner`/`airflow` 그대로 유지한다.
- M5가 `spark_runner` 선택을 붙이는 후속 PR에서 `docs/03-interface-reference.md` 반영 여부를 다시 판단한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
