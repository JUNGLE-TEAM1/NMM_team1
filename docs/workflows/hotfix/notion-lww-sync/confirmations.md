# Notion issue sync last-write-wins hotfix Human Confirmation Gates

Use this file to record when AI should stop and ask for human confirmation.

## Scope Confirm

- Status: recorded
- Ask human to confirm:
  - branch/workspace
  - included scope
  - excluded scope
  - impacted Source of Truth docs
- Human response: 사용자가 `JUNGLE-TEAM1/NMM_team1`의 GitHub Project 3 ↔ Notion 동기화 hotfix를 요청했고, Notion 기준 삭제를 제거하고 LWW 양방향 동기화로 바꾸라고 명시했다.

## Contract Confirm

- Status: recorded
- Ask human to confirm:
  - data model changes
  - interface/API/CLI/UI contract changes
  - external dependencies
  - shared Source of Truth changes
- Human response: 기존 Notion 속성을 그대로 사용하고 schema 변경은 하지 않는 범위로 처리했다.

## Scope Change Confirm

- Status: not needed
- Ask human when:
  - work expands beyond `plan.md`
  - a feature should move to another branch
  - implementation reveals a new product decision
- Human response:

## Verification Confirm

- Status: completed
- Ask human to confirm:
  - test/build/smoke commands
  - TDD evidence or skip reason
  - CI/check commands
  - manual verification path
  - completion criteria
- Human response: `node --check`, Node smoke test, destructive-call 정적 검사, harness validation으로 검증한다.

## Quality Gate Confirm

- Status: completed
- Ask human to confirm:
  - TDD applies or is intentionally skipped
  - required branch checks and CI gates
  - skipped checks and reasons
  - deploy/publish gate if relevant
- Human response: TDD 성격의 smoke test를 추가했고, live API write smoke는 실제 운영 데이터 영향 때문에 dry-run workflow 후속 확인으로 남겼다.

## Git Sync Confirm

- Status: deferred
- Ask human to confirm:
  - start sync command/result before implementation
  - mid-phase upstream change action
  - pre-merge sync command/result before completion
- Human response: branch workspace는 현재 로컬 `main` 기준에서 생성했다. `pull`, `merge`, `rebase`, `push`, PR 생성은 사용자 확인 없이 실행하지 않았다.

## Sync Conflict Confirm

- Status: not needed
- Ask human when:
  - main changed during the Phase
  - shared Source of Truth docs conflict with this branch
  - merge/rebase/pull/push/PR action is needed
- Human response:

## Completion Confirm

- Status: ready-for-review
- Ask human to confirm:
  - changed summary
  - verification result
  - remaining risk
  - next task context
- Human response: 코드와 로컬 검증은 완료했다. 사용자는 변경 확인 후 push/PR 및 GitHub Actions dry-run 실행을 결정하면 된다.

## Integration Conflict Confirm

- Status: not needed
- Ask human when:
  - this branch integrates multiple source branches
  - shared data model or interface conflicts exist
  - acceptance/regression/manual verification paths conflict
- Human response:
