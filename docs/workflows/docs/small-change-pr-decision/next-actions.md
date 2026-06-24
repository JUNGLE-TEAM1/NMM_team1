# Small change PR decision 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: 작은 변경 PR 판단 규칙을 문서에 반영했고 local validation을 통과했다.

## Recommended Next Action / 권장 다음 행동

- 필요하면 PR 준비 여부를 선택한다.
- Reason: local validation은 통과했고, 이 변경은 팀 공유 하네스 규칙이므로 PR 후보지만 이번 턴에는 PR/push가 요청되지 않았다.

## Options / 선택지

1. PR 진행
2. 로컬 완료로 보류
3. script-level dirty checkpoint hardening을 별도 Phase 후보로 유지

## Waiting On Human / 사람 응답 대기

- 현재는 없음.

## Last User Choice / 마지막 사용자 선택

- `프롬프트를 반영해줘`

## Next AI Action / 다음 AI 행동

- 사용자가 PR을 요청하면 포함/제외 파일을 먼저 보고하고 PR 준비를 진행한다.
