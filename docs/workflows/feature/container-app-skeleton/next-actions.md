# Container app skeleton 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: M2 앱 골격과 container smoke 경로가 구현되었고 PR 준비 검사를 진행한다.

## Recommended Next Action / 권장 다음 행동

- PR readiness를 확인하고 자동 PR 생성 흐름을 진행한다.
- Reason: workspace가 complete 상태이고 linked issue `#29`, closing keyword `Closes #29`, local validation 증거가 기록되어 있다.

## Options / 선택지

1. PR 준비 검사를 실행하고 PR을 생성한다.
2. GitHub Actions 결과를 확인한 뒤, 실패하면 같은 branch에서 수정한다.
3. M3 시작 전 첫 source type과 metadata store 결정을 준비한다.

## Waiting On Human / 사람 응답 대기

- PR 생성과 CI 결과 확인

## Last User Choice / 마지막 사용자 선택

- 사용자가 M2 진행을 지시했다.

## Next AI Action / 다음 AI 행동

- `scripts/status-workflow.sh docs/workflows/feature/container-app-skeleton`와 `scripts/prepare-pr.sh --auto-pr docs/workflows/feature/container-app-skeleton`를 실행한다.
