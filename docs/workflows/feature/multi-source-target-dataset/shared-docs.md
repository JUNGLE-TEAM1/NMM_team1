# Multi-source Target Dataset 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | applied: `TargetDataset.source_mappings[]`, Product Health role mapping shape, job definition/handoff 필드 반영 | API/schema 변경 | 낮음, additive field |

## Integration Notes / 통합 메모

- `docs/02-architecture.md`는 module boundary나 runtime architecture 변경 없이 Target Dataset metadata schema를 확장한 additive slice라 수정하지 않았다.
- `docs/05`, `docs/06`, `docs/07`은 관련 기준을 검토했지만 PR size hard gate를 지키기 위해 이번 PR에서는 canonical interface 문서 `docs/03`만 수정했다. 세부 evidence는 workspace/report에 남긴다.
- `contracts/target_dataset_job_draft.sample.json`은 PR size hard gate를 넘기지 않기 위해 이번 PR에서 변경하지 않았다.

## Conflicts To Resolve / 해결할 충돌

- 현재 branch는 `origin/main` `edaf6d1b` 기준으로 시작했다.
