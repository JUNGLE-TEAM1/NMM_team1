# Milestone planning layer harness clarification 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `AGENTS.md` | Register Parallel Milestone Protocol in Source of Truth list and agent rules | Agent entrypoint must know when to apply parallel milestone protocol | medium |
| `docs/00-layer-map.md` | Register Parallel Milestone Protocol layer and propagation/mapping entries | Layer Map must match `AGENTS.md` Source of Truth routing | medium |
| `docs/08-development-workflow.md` | Add milestone planning layer, rolling milestone planning, milestone types, integration branch clarification | Workflow Source of Truth owns Phase start and integration rules | medium |
| `docs/10-next-action-menu.md` | Add milestone classification/provisional/integration decision menus | Next Action Menu owns human-facing collaboration choices | low |
| `docs/17-parallel-milestone-protocol.md` | Clarify independent milestone compatibility, manifest/workspace responsibilities, conflict priority | Parallel Milestone Protocol owns optional multi-workstream execution contract | medium |

## Integration Notes / 통합 메모

- No product runtime integration required.
- Compatibility mock showed independent milestones, parallel manifest, and integration workspace can coexist when `sources.md` uses source workspace paths with trailing slash.
- `docs/reports/README.md` and `docs/reports/milestone-completion-summary.md` are report cleanup changes and should be considered separate from this Source of Truth update during PR packaging.

## Conflicts To Resolve / 해결할 충돌

- `docs/17-parallel-milestone-protocol.md` is currently untracked in the worktree; package/stage decision is deferred to PR/commit preparation.
- `.DS_Store` files are untracked local artifacts and should stay out of PR packaging.
