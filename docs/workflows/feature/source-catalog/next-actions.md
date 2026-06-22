# Source catalog 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: M3 source/catalog implementation is complete locally and ready for PR checks.

## Recommended Next Action / 권장 다음 행동

- PR readiness를 확인하고 자동 PR 생성 흐름을 진행한다.
- Reason: source/catalog API, frontend catalog view, M3 smoke checks가 구현되었다.

## Options / 선택지

1. PR을 생성하고 CI를 확인한다.
2. CI 실패 시 같은 branch에서 수정한다.
3. PR merge 후 M4 최소 파이프라인 실행으로 이동한다.
4. file upload UI가 필요하면 별도 follow-up branch로 분리한다.

## Waiting On Human / 사람 응답 대기

- PR 생성/검증

## Last User Choice / 마지막 사용자 선택

- 사용자가 M3 진행을 지시했다.

## Next AI Action / 다음 AI 행동

- `scripts/status-workflow.sh docs/workflows/feature/source-catalog`와 `scripts/prepare-pr.sh --auto-pr docs/workflows/feature/source-catalog`를 실행한다.
