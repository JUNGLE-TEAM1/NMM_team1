# Transform Builder MVP 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | none | runtime/data-flow architecture는 바꾸지 않는다. | low |
| `docs/03-interface-reference.md` | `process_rule.builder_config` 저장 가능 shape 추가 | Target Dataset metadata에 UI builder 설정이 저장됨을 공유 계약에 반영 | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | Transform Builder MVP acceptance와 `builder_config` 포함 기준 추가 | PR 3 완료 기준을 acceptance에 연결 | low |
| `docs/06-regression-and-failure-scenarios.md` | none | 기존 Target Dataset draft must-not-run guard가 그대로 적용된다. | low |
| `docs/07-manual-verification-playbook.md` | Process 단계 수동 검증 항목을 builder 기준으로 갱신 | 사람이 UI에서 확인해야 할 편집/locked 영역을 명시 | low |

## Integration Notes / 통합 메모

- Source of Truth Impact Gate: required and applied for `docs/03`, `docs/05`, `docs/07`.

## Conflicts To Resolve / 해결할 충돌

- 없음.
