# XFlow 참고 MVP 로드맵 source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- 없음. 외부 local reference만 읽었다.

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| xflow local reference | `/Users/tail1/Documents/데이터 파이프라인/xflow` | not applicable | 2026-06-21 | read-only reference, code copy 없음 |

## Integration Notes / 통합 메모

- XFlow README, backend entrypoint, frontend routes를 참고해 MVP 흐름을 축소했다.
