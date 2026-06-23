# Shared Source of Truth Impact

## Proposed Source Of Truth Changes

| File | Applied change | Evidence |
| --- | --- | --- |
| `docs/11-git-sync-policy.md` | 승인형 PR helper 명칭과 checkpoint evidence 기록 방식 정렬 | applied |
| `docs/10-next-action-menu.md` | PR-ready menu에서 approved helper 의미 정렬 | applied |
| `docs/13-human-command-flow.md` | PR 준비/진행 명령 설명 정렬 | applied |

## Script / Harness Impact

- `scripts/prepare-pr.sh`
- `scripts/validate-harness.sh`
- `scripts/test-harness.sh`

## Not Applied

- `PR 진행` 단계별 분리는 deferred.
- rescue stash cleanup은 deferred.
