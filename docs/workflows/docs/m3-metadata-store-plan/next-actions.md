# M3 metadata store plan 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: M3 source/store/API scope가 보강되었고 PR 준비 검사를 진행한다.

## Recommended Next Action / 권장 다음 행동

- PR readiness를 확인하고 자동 PR 생성 흐름을 진행한다.
- Reason: M3 구현 전 Source of Truth 결정이 정리되었다.

## Options / 선택지

1. PR을 생성하고 CI를 확인한다.
2. PR merge 후 `feature/source-catalog` M3 구현 branch를 시작한다.
3. M3 시작 시 file upload UI 포함 여부를 다시 확인한다.

## Waiting On Human / 사람 응답 대기

- PR 생성/검증

## Last User Choice / 마지막 사용자 선택

- 사용자가 M3 보강을 지시했다.

## Next AI Action / 다음 AI 행동

- `scripts/status-workflow.sh docs/workflows/docs/m3-metadata-store-plan`와 `scripts/prepare-pr.sh --auto-pr docs/workflows/docs/m3-metadata-store-plan`를 실행한다.
