# Full Browser Demo Smoke shared docs

## Applied Source Of Truth Changes

| File | Change | Reason | Risk | Status |
| --- | --- | --- | --- | --- |
| `docs/workflows/feature/full-browser-demo-smoke/quality.md` | browser smoke evidence와 findings 기록 | C-40은 검수 Phase라 workspace evidence가 주요 산출물이다. | low | applied |
| `docs/workflows/feature/full-browser-demo-smoke/report.md` | 성공 경로와 Hotfix 후보 정리 | 다음 Phase/Hotfix 우선순위를 결정하기 위함이다. | low | applied |

## Deferred Source Of Truth Changes

| File | Change | Reason |
| --- | --- | --- |
| `docs/06-regression-and-failure-scenarios.md` | findings 중 실제 Hotfix로 확정되는 항목만 회귀 guard로 승격 | 모든 관찰을 Source of Truth에 즉시 올리면 문서 범위가 커진다. |
| `docs/07-manual-verification-playbook.md` | clean demo reset/preflight가 확정되면 절차 보강 | 현재는 C-40 report에 충분히 기록했다. |
