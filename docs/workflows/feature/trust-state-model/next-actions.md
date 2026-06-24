# Trust State Model 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: local validation passed
- Summary: `feature/trust-state-model`은 trust 상태, publish gate reason, API/UI 표시를 구현했고 local validation이 통과했다. 보완으로 pending gate는 `Verifying`, 명시 실패 gate는 `Blocked`로 분리했다.

## Recommended Next Action / 권장 다음 행동

- Pre-PR Human Checkpoint 또는 추가 보강 선택을 요청한다.
- Reason: local validation은 통과했지만 push/PR/merge 같은 원격 작업은 사람 확인 전 실행하지 않는다.

## Options / 선택지

1. PR 진행: 최종 sync check 후 branch push와 PR 생성을 진행한다.
2. 추가 보강: container smoke, browser 확인, 더 자세한 manual verification을 추가한다.
3. 로컬 완료로 보류: 원격 작업 없이 현재 branch를 local complete 상태로 둔다.
4. 다음 Phase 계획: 이 branch는 보류하고 다음 후보 Phase 범위만 정리한다.

## Next Phase Contract / 다음 Phase 계약

- `Trusted`만 Query/Ask 기본 허용 후보로 본다.
- `Draft`, `Verifying`, `Blocked`는 기본 차단 또는 보류 대상으로 본다.
- 실제 PII/policy provider가 필요하면 이 branch의 mock/fake boundary를 넘는 것이므로 별도 Decision Option Brief가 필요하다.

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 자연어로 지시한다. 원격 작업은 명시 선택 전 실행하지 않는다.

## Last User Choice / 마지막 사용자 선택

- 사용자가 가능하면 진행하고, 불가능하면 거절하며 알리라고 지시함.

## Next AI Action / 다음 AI 행동

- option 1이면 pre-merge sync와 PR readiness check 후 push/PR confirmation 범위 안에서 진행한다.
- option 2이면 선택한 보강 검증을 실행하고 `quality.md`, `report.md`를 갱신한다.
- option 3이면 sync/report에 local hold 상태를 기록한다.
- option 4이면 다음 Phase 후보와 의존성만 정리한다.
