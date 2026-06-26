# Week2 M1 synthetic raw demo sample scale source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- PR #154 / `feature/week2-m1-synthetic-raw`: generator and minimum-start baseline, merged into `origin/main` as `5dd413c`.

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`
- `docs/workflows/feature/week2-m1-synthetic-raw/report.md`
- `docs/reports/week2-m1-synthetic-raw-demo-data.md`
- `scripts/week2_m1_synthetic_raw.py`
- `docs/03-interface-reference.md`
- `contracts/schema_definition.sample.json`
- `contracts/transform_spec.sample.json`
- `contracts/workflow_definition.sample.json`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `origin/main` | not applicable | `5dd413c` | 2026-06-26 | PR #154 merge commit |

## Integration Notes / 통합 메모

- This Phase changes the generator script slightly to mark scale outputs as `option_2_recommended_mvp_demo`.
