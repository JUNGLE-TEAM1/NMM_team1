# AskLake week 2 contract setup 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: AskLake 2주차 공통 계약 fixture package와 Source of Truth 연결이 완료됐고 local validation이 통과했다.

## Recommended Next Action / 권장 다음 행동

- 다음은 M1~M6 중 어떤 구현 workstream을 먼저 열지 선택한다.
- Reason: 6개 fixture contract가 준비됐으므로 각 구현 Phase는 이 계약을 기준으로 시작할 수 있다.

## Options / 선택지

1. M1 플랫폼 코어·통합 Phase를 시작한다.
2. M3 JSON·Schema Phase를 시작한다.
3. M5 Workflow·Catalog Phase를 시작한다.
4. M6 RAG·AI Query Phase를 시작한다.
5. M2/M4 보조 데이터 Phase를 별도로 시작한다.
6. 현재 변경을 PR/push/handoff할지 먼저 확인한다.

## Waiting On Human / 사람 응답 대기

- 다음 구현 Phase 또는 PR/push/handoff 여부 선택.

## Last User Choice / 마지막 사용자 선택

- 사용자가 “진행해”로 공통 계약 설정 Phase 진행을 승인함.

## Next AI Action / 다음 AI 행동

- option 1~5이면 새 Phase workspace를 만들고 해당 workstream 범위만 구현한다.
- option 6이면 Pre-PR Human Checkpoint를 제시하고 사람 선택 전 push/PR/merge는 실행하지 않는다.
