# Week2 responsibility ver2 source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/m1-ui-shell/`
- `docs/workflows/feature/taxi-dataset-bootstrap/`
- `docs/workflows/feature/source-catalog/`
- `docs/workflows/feature/week2-workflow-catalog/`
- `docs/workflows/feature/m6-ai-query-skeleton/`

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`
- Project context:
  - `docs/project-context/asklake-week2-module-plan/README.md`
  - `docs/project-context/asklake-week2-module-plan/plan.md`
  - `docs/project-context/asklake-week2-module-plan/decisions.md`
  - `docs/project-context/asklake-week2-module-plan/meeting-summary.md`
  - `docs/project-context/asklake-week2-module-plan/decision-options.md`
- External draft files:
  - `/Users/tail1/Downloads/asklake-m1-m6-final-nonoverlap-responsibility.md`
  - `/Users/tail1/Downloads/asklake-week2-original-vs-revised-m1-m6-flow.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `origin/main` | `docs/project-context/asklake-week2-module-plan` | `3200907` | 2026-06-25 | 기존 Week2 plan/decisions/meeting context 확인 |
| `origin/main` | `docs/workflows/feature/m1-ui-shell` | `3200907` | 2026-06-25 | M1 UI shell 현재 진척 확인 |
| `origin/main` | `docs/workflows/feature/taxi-dataset-bootstrap` | `3200907` | 2026-06-25 | M2 Taxi bootstrap이 설계/전략 중심임 확인 |
| `origin/main` | `docs/workflows/feature/source-catalog` | `3200907` | 2026-06-25 | M3 기반 source/catalog 진척 확인 |
| `origin/main` | `docs/workflows/feature/week2-workflow-catalog` | `3200907` | 2026-06-25 | M5 workflow/catalog 구현 진척 확인 |
| `origin/main` | `docs/workflows/feature/m6-ai-query-skeleton` | `3200907` | 2026-06-25 | M6 skeleton 상태 확인 |
| external file | `/Users/tail1/Downloads/asklake-m1-m6-final-nonoverlap-responsibility.md` | n/a | 2026-06-25 | 팀원 draft 책임 분리안 |
| external file | `/Users/tail1/Downloads/asklake-week2-original-vs-revised-m1-m6-flow.md` | n/a | 2026-06-25 | 원래 분업과 수정 분업 비교 draft |

## Integration Notes / 통합 메모

- M4는 PR #117의 Kafka replay Parquet demo와 `docs/manual-verification/08-kafka-replay-parquet-demo.md`를 참고했다.
- PR #105는 closed/not merged 상태였으므로 main 기준 진척에는 포함하지 않고, M3 follow-up 후보로만 기록한다.
