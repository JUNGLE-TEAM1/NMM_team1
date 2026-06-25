# 이슈 템플릿 생성 경로 보강 다음 행동 메뉴

## Current State / 현재 상태

- State: ready-for-review
- Summary: `start-workflow.sh` issue 생성 경로가 한국어 title/body/label/body-file을 사용하도록 보강됐고 local harness validation이 통과했다.

## Recommended Next Action / 권장 다음 행동

- 기존 remote issue/PR 보정은 이 하네스 보강이 PR로 통합된 뒤 별도 작업으로 진행한다.
- Reason: 이번 요청은 하네스 보강 우선이며, remote issue/PR 수정은 명시적으로 후순위로 분리했다.

## Options / 선택지

1. PR 준비: final validation 후 이 branch를 PR로 올린다.
2. 보류: 기존 remote 보정 전까지 branch를 로컬에 둔다.
3. 추가 보강: start-workflow issue body를 `.github/ISSUE_TEMPLATE` 파일에서 직접 읽는 방식까지 확장한다.

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

-

## Next AI Action / 다음 AI 행동

- option 1이면 `scripts/prepare-pr.sh --auto-pr docs/workflows/docs/issue-template-generation-guard` 흐름으로 진행한다.
- option 2이면 hold reason과 resume condition을 유지한다.
- option 3이면 별도 scope confirm 후 구현한다.
