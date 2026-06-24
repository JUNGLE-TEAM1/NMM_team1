# WSL2 known gaps guidance 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: WSL2 Tier 1 경로의 known gaps를 문서 운영 지침으로 보강했다.

## Recommended Next Action / 권장 다음 행동

- Local validation을 통과하면 Pre-PR Human Checkpoint를 제시한다.
- Reason: Source of Truth 문서와 manual verification 문서가 바뀌었지만 runtime behavior는 바뀌지 않았다.

## Options / 선택지

1. PR 진행: 문서 보강만 PR로 공유한다.
2. 추가 보강: Windows 운영 문구를 더 다듬는다.
3. 보류: Windows 개발자가 같은 문제를 다시 만나면 재개한다.

## Waiting On Human / 사람 응답 대기

- `PR 진행`, `추가 보강`, `보류` 중 하나를 고른다.

## Last User Choice / 마지막 사용자 선택

- "프롬프트를 적용해줘"

## Next AI Action / 다음 AI 행동

- option 1이면 PR 전 validation과 sync 상태를 확인한 뒤 사람 확인을 받는다.
- option 2이면 문서만 추가 수정하고 validation을 재실행한다.
- option 3이면 `sync.md`에 local hold를 기록한다.
