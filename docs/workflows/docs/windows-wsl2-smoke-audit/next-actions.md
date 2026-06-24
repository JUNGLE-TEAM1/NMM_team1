# Windows WSL2 smoke audit 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: 현재 macOS 환경에서는 Windows WSL2 smoke를 실행하지 못했고, Windows에서 실행할 명령과 기대 결과를 report에 기록했다.

## Recommended Next Action / 권장 다음 행동

- Windows WSL2 환경에서 handoff 명령을 실행하거나, cleanup을 별도 Phase로 분리한다.
- Reason: Windows 지원 완료 판단은 실제 Windows WSL2 evidence가 있어야 한다.

## Options / 선택지

1. Windows WSL2 검증: Windows machine에서 report의 명령을 실행하고 결과를 추가한다.
2. Tooling Phase: 실패 evidence가 생기면 `chore/cross-platform-tooling`을 시작한다.
3. Local Cleanup: stale branch와 unrelated file 정리를 `chore/local-branch-cleanup`으로 분리한다.
4. PR 진행: 이 handoff evidence만 PR로 공유한다.

## Waiting On Human / 사람 응답 대기

- `Windows WSL2 검증`, `Tooling Phase`, `Local Cleanup`, `PR 진행` 중 하나를 고른다.

## Last User Choice / 마지막 사용자 선택

- "프롬프트를 반영해줘"

## Next AI Action / 다음 AI 행동

- option 1이면 Windows 실행 결과를 `quality.md`와 report에 추가한다.
- option 2이면 실패 원인과 개선 범위를 정리한다.
- option 3이면 삭제/정리 대상과 승인 gate를 먼저 기록한다.
- option 4이면 unrelated 변경을 제외하고 이 workspace/report만 선별한다.
