# Thin Runtime Core 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | R0.6 Thin Runtime Core code mapping 추가 | R0.5 shared contract가 실제 code anchor와 연결되게 함 | Low |
| `.milestones/target-mvp/status.yaml` | runtime implementation 상태를 `thin_core_available`로 갱신하고 code mapping 추가 | 첫 병렬 wave 전에 runtime skeleton이 준비됐음을 표시 | Low |

## Integration Notes / 통합 메모

- `docs/02`의 backend layering을 유지하고 새 폴더는 기존 의존 방향을 따른다.
- `docs/05~07`의 R0.5 acceptance/regression/manual verification 기준은 유지된다.
- 실제 병렬 branch는 아직 생성하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- none known
