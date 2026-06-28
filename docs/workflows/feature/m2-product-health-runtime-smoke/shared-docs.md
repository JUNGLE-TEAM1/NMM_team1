# M2 product health runtime smoke 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | `RuntimeConfig.source_inputs[]` multi-source pass-through runtime input을 기록 | M2/M3/M5가 product health 대표 경로 입력을 같은 shape로 이해해야 한다. | 낮음: additive contract |
| `contracts/runtime_config.sample.json` | `product_health_runtime_smoke.source_inputs[]` fixture 추가 | M2 smoke와 M3/M5 integration handoff의 예시 입력이 필요하다. | 낮음: additive fixture |

## Integration Notes / 통합 메모

- M2는 `source_inputs[]`로 raw input을 읽고 Parquet output/evidence를 만들 수 있게 됐다.
- M3는 이 경로 위에 Bronze/Silver/Gold `TransformSpec` semantics를 후속으로 얹어야 한다.
- M5는 top-level `output_path`가 directory일 수 있고 source별 output file은 `task_results[].output_path`에 있다는 점을 소비할 때 확인해야 한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
