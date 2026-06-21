# Sync PR finalization guard 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` |  |  |  |
| `docs/03-interface-reference.md` |  |  |  |
| `docs/05-acceptance-scenarios-and-checklist.md` |  |  |  |
| `docs/06-regression-and-failure-scenarios.md` |  |  |  |
| `docs/07-manual-verification-playbook.md` |  |  |  |
| `docs/11-git-sync-policy.md` | Add PR preflight sync check and post-merge finalize commands | Sync policy owns PR/issue lifecycle records | Low; policy-only |
| `docs/13-human-command-flow.md` | Add `--check-pr-sync` before PR and `--finalize` after merge | Human command flow must prevent stale sync.md records | Low; workflow docs |
| `scripts/prepare-pr.sh` | Add `--check-pr-sync` and `--finalize` | PR handoff script owns local/remote sync record updates | Medium; shell workflow |
| `scripts/validate-harness.sh` | Add static sync.md Push / PR consistency checks in strict mode | CI-safe detection for stale or contradictory sync fields | Medium; validation may catch old bad records |

## Integration Notes / 통합 메모

- MVP and infrastructure workspace sync records were updated to match actual merged/closed states.

## Conflicts To Resolve / 해결할 충돌

- 
