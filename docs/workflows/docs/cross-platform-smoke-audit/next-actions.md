# Cross-platform smoke audit 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: macOS + Docker Desktop 권장 경로에서 tool readiness와 container smoke가 통과했다. Windows WSL2/native Windows 검증은 현재 환경에서 실행하지 않았다.

## Recommended Next Action / 권장 다음 행동

- Windows WSL2 smoke evidence를 확보하거나, 이번 audit report를 PR로 공유한다.
- Reason: macOS evidence는 확보됐지만 Windows 동등성은 Windows 환경에서 한 번 더 실행해야 한다.

## Options / 선택지

1. PR 진행: macOS smoke audit evidence를 PR로 공유한다.
2. Windows WSL2 검증: Windows machine에서 같은 readiness/smoke 명령을 실행하고 report를 보강한다.
3. Tooling Phase: native Windows 지원이 필요하면 `chore/cross-platform-tooling`을 시작한다.
4. 로컬 완료로 보류: Windows evidence 전까지 이 audit을 local complete로 둔다.

## Waiting On Human / 사람 응답 대기

- `PR 진행`, `Windows WSL2 검증`, `Tooling Phase`, `로컬 완료로 보류` 중 하나를 고른다.

## Last User Choice / 마지막 사용자 선택

- "그러면 지금 pr마무리하고 진행해"

## Next AI Action / 다음 AI 행동

- option 1이면 report/index/workspace 파일만 선별해 PR을 준비한다.
- option 2이면 Windows 실행 결과를 받아 quality/report에 추가한다.
- option 3이면 native Windows support boundary와 helper 후보를 scope로 잡는다.
- option 4이면 sync.md deferral reason을 유지한다.
