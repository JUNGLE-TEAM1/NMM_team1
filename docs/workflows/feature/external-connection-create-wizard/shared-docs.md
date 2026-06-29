# External connection create wizard 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 이번 R-2에서는 직접 수정하지 않음 | UI-only demo wizard이며 실제 connector/data architecture 변경 없음 | 낮음 |
| `docs/03-interface-reference.md` | 이번 R-2에서는 직접 수정하지 않음 | API/schema/backend contract 변경 없음 | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 이번 R-2에서는 직접 수정하지 않음 | workspace `quality.md`와 `report.md`에 browser smoke evidence 기록 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 이번 R-2에서는 직접 수정하지 않음 | credential/backend 연결 없음, 실패 범위는 UI entry smoke | 낮음 |
| `docs/07-manual-verification-playbook.md` | 이번 R-2에서는 직접 수정하지 않음 | manual path는 workspace evidence로 충분 | 낮음 |

## Integration Notes / 통합 메모

- R-2 구현은 `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`, 이 workspace 문서에 반영됨.
- Source Dataset wizard 보정은 R-3에서 진행한다.

## Conflicts To Resolve / 해결할 충돌

-
