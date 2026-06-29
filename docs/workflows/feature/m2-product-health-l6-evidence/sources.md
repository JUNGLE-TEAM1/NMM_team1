# M2 Product Health 실제 L6 실행 증거 생성 source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/m2-product-health-runtime-smoke`
- `docs/workflows/feature/m2-l6-preview-runner-adapter`

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
| `main` historical workspace | `docs/workflows/feature/m2-product-health-runtime-smoke` | `94e67c5` | 2026-06-28 | Product Health source 4종 pass-through evidence 경계 |
| `main` historical workspace | `docs/workflows/feature/m2-l6-preview-runner-adapter` | `94e67c5` | 2026-06-28 | M3 L6 preview-only spec 실행 경계 |

## Integration Notes / 통합 메모

- 이 branch는 두 기존 M2 경계를 결합한다. `source_inputs[]`는 source별 evidence용이고, `transform_spec_path`는 L6 Gold preview 실행용이다.
