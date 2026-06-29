# Target dataset job alignment 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 이번 R-4에서는 직접 수정하지 않음 | UI-only demo review alignment이며 실제 ETL job architecture 변경 없음 | 낮음 |
| `docs/03-interface-reference.md` | 이번 R-4에서는 직접 수정하지 않음 | API/schema/backend job contract 변경 없음 | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 이번 R-4에서는 직접 수정하지 않음 | workspace `quality.md`와 `report.md`에 browser smoke evidence 기록 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 이번 R-4에서는 직접 수정하지 않음 | 실제 ETL 실행/backend 저장 없음, 실패 범위는 UI smoke | 낮음 |
| `docs/07-manual-verification-playbook.md` | 이번 R-4에서는 직접 수정하지 않음 | manual path는 workspace evidence로 충분 | 낮음 |

## Integration Notes / 통합 메모

- R-4 구현은 `frontend/src/app/App.jsx`, 이 workspace 문서에 반영됨.
- backend persistence/API Phase를 만들 때 `docs/02`와 `docs/03`을 업데이트해야 한다.

## Conflicts To Resolve / 해결할 충돌

-
