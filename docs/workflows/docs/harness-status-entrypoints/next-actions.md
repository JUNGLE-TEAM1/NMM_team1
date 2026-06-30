# Harness status entrypoints 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: docs change implemented
- Summary: 하네스 상태 확인 entrypoint와 report evidence reading ladder를 추가했다.

## Recommended Next Action / 권장 다음 행동

- 원하면 별도 Phase로 workspace 상태 frontmatter/YAML 구조화를 검토한다.
- Reason: 이번 변경은 길 찾기 안내를 보강했고, 문자열 기반 검증 취약성 개선은 script/test 변경을 동반하는 별도 작업이다.

## Options / 선택지

1. 이 문서 개선을 로컬 완료로 둔다.
2. 별도 Phase로 workspace metadata 구조화를 시작한다.
3. 별도 Phase로 `validate-harness.sh`/`test-harness.sh` 모듈화를 시작한다.
4. PR-ready 경로가 필요하면 기존 사용자 변경과 branch 상태를 먼저 정리한다.

## Waiting On Human / 사람 응답 대기

- 다음 개선 범위를 고르거나 현재 변경을 유지한다.

## Last User Choice / 마지막 사용자 선택

- "해주세요"를 상태 확인 entrypoint 보강으로 실행.

## Next AI Action / 다음 AI 행동

- option 1이면 추가 작업 없이 현재 변경을 설명한다.
- option 2 또는 3이면 별도 Phase/workspace를 만든다.
- option 4이면 현재 dirty branch와 사용자 수정 파일을 먼저 확인한다.
