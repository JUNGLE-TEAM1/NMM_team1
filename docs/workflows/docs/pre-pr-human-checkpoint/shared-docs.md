# Shared Source of Truth Impact

## Proposed Source Of Truth Changes

| File | Applied change | Evidence |
| --- | --- | --- |
| `docs/08-development-workflow.md` | `Pre-PR Human Checkpoint`와 no-auto-PR 원칙 추가 | applied |
| `docs/11-git-sync-policy.md` | PR/push 승인, 보류 deferral 기록 방식 정리 | applied |
| `docs/12-quality-gates.md` | local quality pass가 PR/push 승인이 아님을 명시 | applied |
| `docs/13-human-command-flow.md` | 상태 질문과 명시 PR 명령을 분리 | applied |
| `docs/10-next-action-menu.md` | PR-ready 메뉴를 checkpoint 선택지로 수정 | applied |
| `docs/09-collaboration-agreement.md` | confirmation gate에 checkpoint 추가 | applied |

## Additional Harness Rule Files

- `AGENTS.md`: repository-level 최소 규칙에 checkpoint 추가.
- `docs/workflows/README.md`: workspace 운영 설명에 checkpoint 추가.

## Not Applied

- `scripts/prepare-pr.sh`는 이번 Phase에서 수정하지 않았다.
- validation script에 새 필드 강제는 후속 후보로 보류했다.
