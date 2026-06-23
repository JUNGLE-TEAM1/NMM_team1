# Decisions

- Decision status: accepted

## Decision Option Briefs

- Not needed for `--approved-pr` alias: low-risk compatibility naming fix.

## Accepted Decisions

| Decision | Selected option | Reason |
| --- | --- | --- |
| PR helper naming | Add `--approved-pr` and keep `--auto-pr` as deprecated compatibility alias | 줄임표 없이 동작 호환성을 유지하면서 새 정책 의미를 명확히 한다. |
| Checkpoint evidence | Prefer `confirmations.md` section and allow `sync.md` / `next-actions.md` evidence | 기존 workspace와 호환하면서 새 작업의 기록 위치를 분명히 한다. |
| `PR 진행` command scope | Keep the current broad command scope | 사람 판단상 별도 단계 분리는 현재 필요하지 않다. |
| Rescue stash handling | No action in this Phase | stash 삭제는 이번 PR 범위와 무관하며, 필요 시 별도 local cleanup으로 처리한다. |

## Deferred Decisions

| Decision | Reason | Revisit trigger | Target branch/phase |
| --- | --- | --- | --- |
| None | - | - | - |

## Revisit / Rollback Conditions

- `--auto-pr` 사용이 반복적으로 혼동을 만들면 compatibility alias도 제거한다.
- `--approved-pr`가 CI 또는 기존 scripts에서 문제를 만들면 `--push --create-pr` 직접 조합으로 되돌린다.
