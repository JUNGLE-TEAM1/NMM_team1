# Notion issue sync last-write-wins hotfix Next Action Menu

Use this file to guide the human through the next collaboration choice.

## Current State

- State: local hotfix implemented
- Summary: GitHub Project ↔ Notion sync script/workflow 수정과 로컬 smoke 검증이 완료됐다. 원격 push/PR 및 live dry-run은 아직 실행하지 않았다.

## Recommended Next Action

- Review local diff, then decide whether to push/open PR and run GitHub Actions `workflow_dispatch` with `dry_run=true`.
- Reason: 실제 GitHub/Notion 쓰기 전 dry-run으로 mutation 계획을 확인해야 한다.

## Options

1. 로컬 diff를 리뷰하고 PR 준비를 진행한다.
2. GitHub Actions에서 `dry_run=true`로 먼저 실행한다.
3. 추가 schema/tombstone 정책은 별도 작업으로 분리한다.
4. 이번 hotfix를 보류하고 branch를 유지한다.

## Waiting On Human

- Human review / push / PR decision.

## Last User Choice

- User requested hotfix implementation.

## Next AI Action

- If option 1 is chosen, run final requested checks and prepare PR handoff summary.
- If option 2 is chosen, run the workflow manually with `dry_run=true` after branch is pushed.
- If option 3 is chosen, create a separate workspace for explicit Notion deletion/tombstone design.
- If option 4 is chosen, record pause reason in `notes.md`.
