# M1 post-merge readiness smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m1-post-merge-readiness-smoke`, `docs/workflows/feature/m1-post-merge-readiness-smoke`
- Date: 2026-06-29
- Workspace state: draft
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/08-development-workflow.md`, `docs/10-next-action-menu.md`, latest merged/open PR status, M1/M2/M6 관련 최신 report 일부
- Escalated context read: not yet
- Context omitted intentionally: 전체 report archive와 미병합 PR diff 상세 구현은 아직 읽지 않음. Phase 생성만 수행했다.
- Changed: `feature/m1-post-merge-readiness-smoke` branch workspace를 생성하고 M1 최신 main 재검증 범위를 기록했다. GitHub issue #255를 생성 후 자동 종료 상태에서 다시 open으로 복구했다.
- Verified: `scripts/status-workflow.sh docs/workflows/feature/m1-post-merge-readiness-smoke` 실행, `git diff --check` 통과. 실제 browser smoke는 아직 실행하지 않음.
- Remaining: Scope/verification confirmation을 닫고 최신 main 기준 `/query` browser smoke를 수행한다. 필요 시 stale M1 report 문구를 정리한다.
- Next context: option 1 선택 시 browser skill을 사용해 Product Health readiness/CTA/route trace를 smoke한다.
- Risk: `dataset_product_health_gold` 최종 Catalog/Gold output은 아직 main/로컬에 없으므로 ready 표시를 기대하면 안 된다.
