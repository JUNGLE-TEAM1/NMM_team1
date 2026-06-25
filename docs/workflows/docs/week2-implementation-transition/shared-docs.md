# Week2 implementation transition 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/project-context/asklake-week2-module-plan/ver2/README.md` | `implementation-transition-plan.md`를 읽는 순서와 Phase 2 기준으로 추가 | Phase 2 산출물을 ver2 진입점에서 찾을 수 있어야 함 | 낮음 |
| `docs/project-context/asklake-week2-module-plan/ver2/implementation-transition-plan.md` | 새 전환 계획 문서 추가 | 기존 구현 위에 ver2를 얹는 순서를 고정하기 위해 | 낮음 |
| `docs/03-interface-reference.md` | 후속 Phase 6 이후 runner boundary 계약 반영 검토 | 호출 계약 확정 전에는 보류 | 중간 |
| `contracts/*.sample.json` | 후속 implementation에서만 조정 | 현재는 문서 전환 계획이며 sample fixture 변경은 범위 밖 | 중간 |

## Integration Notes / 통합 메모

- Source of Truth 전체 rewrite는 하지 않는다.
- ver2 project-context 문서만 현재 작업 기준으로 확장한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
