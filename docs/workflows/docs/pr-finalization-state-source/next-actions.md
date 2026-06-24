# PR finalization state source 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: in progress
- Summary: post-merge stale `sync.md` 보정 규칙과 스크립트 변경을 적용했고, 최종 검증을 진행 중이다.

## Recommended Next Action / 권장 다음 행동

- 최종 validation 후 Pre-PR Human Checkpoint 선택을 요청한다.
- Reason: 하네스 상태 스크립트 동작이 바뀌므로 PR 전 local evidence를 완료해야 한다.

## Options / 선택지

1. PR 진행: final validation 후 push/PR/CI/merge/finalize를 진행한다.
2. 로컬 완료로 보류: 현재 branch를 local hold로 둔다.
3. 추가 보강: GitHub unavailable fallback이나 cleanup 기준을 더 강화한다.
4. 다음 Phase: 이 branch PR/hold 여부를 먼저 확정한다.

## Waiting On Human / 사람 응답 대기

- PR 진행, 로컬 보류, 추가 보강, 다음 Phase 중 하나를 선택한다.

## Last User Choice / 마지막 사용자 선택

- User asked to apply the hardening prompt. No PR/push request was included.

## Next AI Action / 다음 AI 행동

- option 1이면 final validation을 다시 실행하고 `scripts/prepare-pr.sh --approved-pr docs/workflows/docs/pr-finalization-state-source`로 진행한다.
- option 2이면 `sync.md`의 deferral reason을 유지한다.
- option 3이면 Scope Change Confirm 후 별도 보강 범위를 계획한다.
- option 4이면 현재 branch PR/hold 여부를 먼저 확정한다.
