# GitHub record drift audit 보강 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete, PR-ready after final strict validation
- Summary: GitHub issue/PR record drift audit 보강은 구현됐고, #112형 우회 감지와 정상 record 통과 fixture가 추가됐다.

## Recommended Next Action / 권장 다음 행동

- final validation 후 PR을 생성한다.
- Reason: 기존 record 수정은 제외하고 하네스 재발 방지 규칙과 검증이 준비됐다.

## Options / 선택지

1. PR 생성: `scripts/prepare-pr.sh --auto-pr docs/workflows/docs/github-record-drift-audit`
2. PR 보류: 현재 branch를 로컬에 두고 재개 조건을 기록한다.
3. 추가 보강: audit 기준 또는 PR body drift 기준을 더 엄격하게 조정한다.
4. 후속 보정: 하네스 보강 병합 뒤 #112 등 기존 GitHub record를 템플릿에 맞게 수정한다.

## Waiting On Human / 사람 응답 대기

- PR 생성 또는 보류 선택.

## Last User Choice / 마지막 사용자 선택

- "프롬프트를 반영해줘"

## Next AI Action / 다음 AI 행동

- final validation 결과를 `quality.md`, `sync.md`, `report.md`에 반영한다.
- 사람이 PR 마무리를 요청하면 `scripts/prepare-pr.sh --auto-pr docs/workflows/docs/github-record-drift-audit`를 실행한다.
