# Local environment requirements 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: 로컬 개발 환경 요구사항과 macOS/Windows 지원 기준을 Source of Truth와 검증 문서에 반영했고 local harness validation이 통과했다.

## Recommended Next Action / 권장 다음 행동

- Small Change Completion Decision을 진행한다.
- Reason: 팀 공유 하네스 기준 변경이므로 PR 후보지만, 현재 worktree에는 기존 unrelated 변경이 있어 포함 파일을 분리해야 한다.

## Options / 선택지

1. PR 진행: 이번 Phase 파일만 선별해 PR packaging을 준비한다.
2. 로컬 완료로 보류: 현재 변경을 local complete 상태로 두고 후속 Windows audit 전에 재개한다.
3. 추가 수정: 로컬 환경 문구나 후속 Phase 후보를 더 다듬는다.
4. 다음 Phase 시작: `docs/cross-platform-smoke-audit` 또는 `chore/cross-platform-tooling`을 별도 Phase로 시작한다.

## Waiting On Human / 사람 응답 대기

- `PR 진행`, `로컬 완료로 보류`, `추가 수정`, `다음 Phase` 중 하나를 고른다.

## Last User Choice / 마지막 사용자 선택

- "프롬프트를 적용해줘"

## Next AI Action / 다음 AI 행동

- option 1이면 unrelated 변경과 `.DS_Store`를 제외하고 이번 Phase 파일만 보고한 뒤 PR 준비를 진행한다.
- option 2이면 `sync.md`에 local hold를 유지한다.
- option 3이면 해당 문서만 추가 수정하고 validation을 재실행한다.
- option 4이면 별도 workspace를 만들기 전에 branch/sync 상태를 다시 확인한다.
