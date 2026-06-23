# Modular Contract Baseline 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: R0.5 Modular Contract Baseline 문서/manifest/handoff template 정렬과 local validation이 완료되었다.

## Recommended Next Action / 권장 다음 행동

- `Pre-PR Human Checkpoint` 선택이 필요하다.
- Reason: local validation이 통과했고 PR/push/handoff가 다음 자연스러운 행동이지만, 사람 선택 전 remote action은 실행하지 않는다.

## Options / 선택지

1. `PR 진행`: 승인 후 issue 연결, push, PR 생성, CI 확인, merge/finalize를 진행한다.
2. `로컬 완료로 보류`: branch를 local complete 상태로 두고 다음 재개 조건만 남긴다.
3. `추가 수정`: manifest scope나 contract baseline을 더 좁힌다.
4. `다음 Phase`: 현재 branch 처리 방식을 먼저 정한 뒤 첫 병렬 wave를 시작한다.

## First Wave Candidate / 첫 병렬 wave 후보

- Catalog / Trust
- Source Connector
- Job / Orchestrator
- Query / Policy mock

주의: 위 후보는 실행 승인이 아니다. 실제 병렬 worktree/thread/branch 생성은 현재 branch의 PR 또는 local hold 선택 후 별도 사람 승인으로 시작한다.

## Waiting On Human / 사람 응답 대기

- `PR 진행`, `로컬 완료로 보류`, `추가 수정`, `다음 Phase` 중 하나를 고른다.

## Last User Choice / 마지막 사용자 선택

- user requested prompt application; PR/handoff choice not yet provided.

## Next AI Action / 다음 AI 행동

- option 1이면 final validation 후 approved PR handoff를 진행한다.
- option 2이면 `sync.md` deferral reason과 final response에 재개 명령을 남긴다.
- option 3이면 requested scope를 Source of Truth에 최소 반영한다.
- option 4이면 현재 branch를 PR 또는 명시 보류한 뒤 첫 병렬 wave 계획을 시작한다.
