# M2 L6 preview runner adapter 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | `RuntimeConfig.transform_spec` / `transform_spec_path`가 있으면 M2 `spark_runner`가 M3 L6 preview-only spec을 실행한다는 경계를 추가한다. | M3/M5가 M2 runner를 호출할 때 어떤 필드와 실패 규칙을 기대할 수 있는지 명확히 하기 위해서다. | 낮음. additive contract이며 기존 runner selector와 executor 이름은 바꾸지 않는다. |
| `contracts/runtime_config.sample.json` | `l6_preview_runtime_smoke` 예시와 지원 operation 목록, unsupported operation 실패 규칙을 추가한다. | 기계가 읽을 수 있는 sample contract에도 L6 preview handoff 모양을 남기기 위해서다. | 낮음. 새 sample key 추가이며 기존 sample key는 유지한다. |

## Integration Notes / 통합 메모

- M3는 L6 spec 의미와 compiler validation을 계속 소유한다.
- M2는 spec에 있는 지원 operation을 preview로 실행하고, 지원하지 않는 operation은 failed result로 반환한다.
- M5는 직접 `spark_runner`를 호출할 수 있지만 Airflow DAG 내부 wiring은 이번 PR 범위가 아니다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
