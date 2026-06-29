# Data integration wizard flow 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: locally verified
- Summary: 데이터 통합 화면을 AWS 설정 흐름처럼 상단 가로 stepper + 현재 단계 panel 구조로 정리했다.

## Recommended Next Action / 권장 다음 행동

- 사람 demo 확인 후 Target step Phase로 이동한다.
- Reason: Source와 Transform은 wizard 안에서 동작하고, 다음 자연스러운 입력은 결과 dataset 이름이다.

## Options / 선택지

1. 현재 wizard UI를 사람 눈으로 확인한다.
2. 다음 Phase로 Target step의 `target_name` 입력을 추가한다.
3. Source modal의 source type/card UI를 더 XFlow식으로 다듬는다.
4. Target/Run placeholder copy를 수정한다.

## Waiting On Human / 사람 응답 대기

- demo 화면 확인과 다음 Phase 선택.

## Last User Choice / 마지막 사용자 선택

- "UI가 이상한데 AWS거나 XFlow 참고해서 개선해"

## Next AI Action / 다음 AI 행동

- option 1이면 사용자 피드백을 현재 Phase 문서나 다음 Phase plan에 반영한다.
- option 2이면 `feature/data-integration-target-step` 구현으로 진행한다.
- option 3이면 Source modal 개선 Phase를 별도로 만든다.
- option 4이면 현재 placeholder copy를 수정한다.
