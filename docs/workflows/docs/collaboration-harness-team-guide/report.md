# 협업 하네스 팀 사용 가이드 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/collaboration-harness-team-guide`, `docs/workflows/docs/collaboration-harness-team-guide`
- Date: 2026-06-28
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`, `docs/09-collaboration-agreement.md`, `docs/10-next-action-menu.md`, `docs/13-human-command-flow.md`
- Escalated context read: 17주차 참고 양식 `AskLake/06_AskLake_MVP와_데모전략_학습.md`, `study/04-backend-control-security-observability-template.md`
- Context omitted intentionally: runtime code internals, unrelated Week2 reports, unrelated branch workspace details
- Changed: 팀원용 `AskLake 협업 하네스 사용 가이드`를 추가하고, 처음 보는 사람도 빠르게 이해할 수 있는 `3분 요약`, 하네스를 쓰면 좋아지는 점, 문맥 저장 핵심 기능, 문맥 충분성 확인 책임, 공유 문맥 정렬 책임, 하네스 관리 항목별 이유 문단, 사람/AI 책임 구분, 팀원의 5가지 협업 책임 섹션을 보강했으며, report index/workspace evidence를 갱신했다.
- Verified: `rg`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: PR 리뷰 후 팀 표현/운영 사례를 추가로 보강할 수 있다.
- Next context: 팀원은 이 guide의 `3분 요약`, `이 하네스를 왜 쓰는가`, `이 하네스를 쓰면 좋아지는 것`을 먼저 읽고 하네스가 작업 문맥을 저장하는 이유, 작업 기록과 작업 문맥의 차이, 문맥 충분성 확인 책임, 공유 문맥 정렬 책임, Phase 시작, 확인 gate 응답, 사람/AI 책임 경계, 5가지 협업 책임, PR/merge 경계 표현을 익힌다.
- Risk: 이 문서는 설명/온보딩 guide이며 Source of Truth 규칙 자체를 변경하지 않는다.
