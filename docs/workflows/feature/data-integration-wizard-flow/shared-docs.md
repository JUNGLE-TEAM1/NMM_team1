# Data integration wizard flow 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | none | backend/API/schema 변경 없음 | low |
| `docs/03-interface-reference.md` | none | interface contract 변경 없음 | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | 추후 데이터 통합 UX acceptance에 wizard flow를 반영할 수 있음 | demo 핵심 흐름 후보 | medium |
| `docs/06-regression-and-failure-scenarios.md` | 추후 단계 진행/뒤로가기/placeholder 기준 추가 가능 | UI 회귀 방지 | medium |
| `docs/07-manual-verification-playbook.md` | 추후 Source -> Transform -> Target -> Review 경로 추가 가능 | 사람 데모 확인 경로 필요 | medium |

## Integration Notes / 통합 메모

- 이번 Phase에서는 공유 Source of Truth 문서를 직접 수정하지 않고 branch workspace와 frontend 구현만 보정했다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
