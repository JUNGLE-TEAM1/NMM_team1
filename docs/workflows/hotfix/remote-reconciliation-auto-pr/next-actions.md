# Remote reconciliation auto PR 다음 행동 메뉴

## Current State / 현재 상태

- State: complete, PR-ready
- Summary: remote operations reconciliation 자동 PR 정책과 추천 로직이 구현됐고 local regression이 통과했다.

## Recommended Next Action / 권장 다음 행동

- local validation을 완료하고 PR-ready 조건이 clear이면 자동 PR을 생성한다.
- Reason: 이 작업 자체가 방금 추가한 remote reconciliation auto PR 정책의 적용 대상이다.

## Options / 선택지

1. 검증 통과 후 자동 PR 생성.
2. 검증 실패 시 수정 후 재검증.
3. scope drift가 발견되면 보류 이유와 재개 조건 기록.

## Waiting On Human / 사람 응답 대기

- final strict validation and PR creation.

## Last User Choice / 마지막 사용자 선택

- `프롬프트를 반영해줘`

## Next AI Action / 다음 AI 행동

- final strict validation 후 `scripts/prepare-pr.sh --auto-pr docs/workflows/hotfix/remote-reconciliation-auto-pr` 실행.
