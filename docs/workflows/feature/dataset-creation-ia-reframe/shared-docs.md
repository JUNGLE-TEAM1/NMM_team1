# Dataset creation IA reframe 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/08-development-workflow.md` | `Dataset Creation IA Reframe Queue`를 추가하고 기존 D-* 큐를 superseded로 표시 | External Connection 단계가 빠진 기존 데이터셋 생성 IA를 교정하기 위해 필요 | 중간. 같은 파일에 unrelated context assumption 변경이 워킹트리에 남아 있어 commit/stage 시 주의 필요 |
| `docs/02-architecture.md` |  |  |  |
| `docs/03-interface-reference.md` |  |  |  |
| `docs/05-acceptance-scenarios-and-checklist.md` | 이번 R-1에서는 직접 수정하지 않음 | 기존 데모 acceptance의 entry smoke로 확인 가능 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 이번 R-1에서는 직접 수정하지 않음 | backend/API/schema 영향 없음 | 낮음 |
| `docs/07-manual-verification-playbook.md` | 이번 R-1에서는 직접 수정하지 않음 | browser smoke evidence를 workspace `quality.md`와 `report.md`에 기록 | 낮음 |

## Integration Notes / 통합 메모

- R-1 구현은 `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`, 이 workspace 문서에 반영됨.
- `docs/08-development-workflow.md`의 R-* 큐는 후속 Phase 순서의 기준이다.

## Conflicts To Resolve / 해결할 충돌

-
