# Data integration transform step 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: locally verified
- Summary: Source 선택 뒤 `Select Fields` 체크박스로 Transform step을 설정하고 카드 요약에 반영하는 흐름을 추가했다.

## Recommended Next Action / 권장 다음 행동

- 사람 demo 확인 후 Target step Phase로 이동한다.
- Reason: Source와 Transform의 첫 데모 흐름이 이어졌고, 다음 자연스러운 입력은 결과 dataset 이름/대상 설정이다.

## Options / 선택지

1. 현재 Transform step UI를 사람 눈으로 확인한다.
2. 다음 Phase로 Target step의 결과 dataset 이름 설정 UI를 추가한다.
3. Transform 선택 필드를 실제 pipeline payload와 연결하는 별도 Phase를 만든다.
4. 필드 선택 UX를 checkbox 대신 compact list/multi-select로 바꾼다.

## Waiting On Human / 사람 응답 대기

- demo 화면 확인과 다음 Phase 선택.

## Last User Choice / 마지막 사용자 선택

- "다음 페이즈로 넘어가자"

## Next AI Action / 다음 AI 행동

- option 1이면 사용자 피드백을 현재 Phase 문서나 다음 Phase plan에 반영한다.
- option 2이면 Target step workspace로 진행한다.
- option 3이면 payload 연결 workspace를 생성한다.
- option 4이면 현재 Transform UI를 수정한다.
