# Dataset draft overview 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: 데이터셋 시작 화면에 저장된 External Connection / Source Dataset / Target Dataset draft overview와 새로고침 버튼을 추가했다.
- Verified: frontend build 통과, browser smoke에서 빈 상태와 smoke record 3종 표시를 확인했고 smoke data를 정리했다.
- Remaining: Target Dataset draft를 실제 run handoff로 넘기는 C-4.
- Next context: C-4는 overview 또는 Target Dataset draft 목록에서 실행할 draft를 선택해 `Job Run` record를 생성하는 흐름으로 이어진다.
- Risk: 현재 목록은 최근 draft 확인용이며 상세 편집/삭제/실행은 제공하지 않는다.
