# Windows WSL2 smoke audit 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/reports/windows-wsl2-smoke-audit.md` | Add Windows WSL2 execution handoff and not-executed evidence | Evidence gap belongs in reports, not Source of Truth | Low |
| `docs/reports/README.md` | Add report index row | Make handoff discoverable | Low |

## Integration Notes / 통합 메모

- No Source of Truth change proposed. `docs/04` support tier remains unchanged.

## Conflicts To Resolve / 해결할 충돌

- none
