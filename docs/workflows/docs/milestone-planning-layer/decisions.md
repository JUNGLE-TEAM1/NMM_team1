# Milestone planning layer harness clarification 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: mixed

## Decision Option Briefs / 결정 옵션 브리프

- not needed; this was a harness documentation clarification based on user discussion.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Milestone planning layer | Add as planning layer, not replacement for Phase Workflow | Keeps existing branch workspace execution model intact | user discussion / 2026-06-23 |
| Parallel protocol relationship | Keep as optional execution contract layer | Avoids forcing `.milestones` manifest on every independent milestone | user discussion / 2026-06-23 |
| Integration branch requirement | Required only when multiple completed branches must be validated together | Prevents late independent milestones from blocking unrelated PRs | user discussion / 2026-06-23 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Direct milestone metadata parsing in status/validation | Current change is docs-only; script behavior change needs separate harness enhancement Phase | When users need `status-workflow.sh` to show milestone classification or detect manifest/workspace scope mismatch | future harness enhancement Phase |
| `docs/17-parallel-milestone-protocol.md` tracking state | File was already untracked in the worktree before this correction; staging/commit strategy should be handled with the broader branch state | Before PR preparation or commit packaging | `docs/milestone-planning-layer` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Milestone planning layer | Small fixes become too heavy | Use lightweight Phase exception |
| Parallel manifest responsibility | Workspace plan conflicts with manifest scope | Stop implementation and ask which source to update |
