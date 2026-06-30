# Gold input return flow 계획

## 목표

C33에서 Gold wizard에서 Source/Silver 생성으로 빠지는 shortcut을 만들었다. C34는 그 생성 결과가 다시 Gold 입력 선택 단계로 이어지게 해서 demo flow가 끊기지 않게 한다.

## 범위

- Gold shortcut으로 `Silver Dataset 생성`에 진입한 경우, 저장 후 Gold wizard `Silver 선택` 단계로 돌아온다.
- 방금 만든 Silver Dataset을 Gold 입력으로 자동 선택하고 Base silver로 둔다.
- Gold shortcut으로 `Source Dataset 생성`에 진입한 경우, Source 저장 후 Silver rules 단계로 이어지도록 return flow를 준비한다.
- 기존 목록에서 시작한 Source/Silver 생성은 기존처럼 저장 후 목록으로 돌아간다.

## 제외 범위

- Gold draft를 local/session storage에 임시 저장.
- Source -> Silver -> Gold 전체 clean-room E2E 완료 선언.
- 자동 recipe 추천.
- backend API/schema 변경.

## Acceptance Criteria

- Gold wizard `Silver 선택`에서 `Silver Dataset 생성`을 누른다.
- Source Dataset을 선택하고 Silver metadata를 저장한다.
- 저장 후 Gold wizard `Silver 선택`으로 돌아온다.
- 방금 만든 Silver가 selected/base silver로 표시된다.
- console error가 없다.

## Regression / Failure Scenario

- 일반 Silver Dataset 생성 저장 후 목록 복귀가 깨지면 실패다.
- Gold shortcut으로 저장한 Silver가 Gold 입력으로 선택되지 않으면 실패다.
- 저장 실패 시 Gold wizard로 이동해 성공처럼 보이면 실패다.

## Manual Verification

1. `/datasets/gold`로 이동한다.
2. `Gold Dataset 생성 -> 다음`으로 `Silver 선택` 단계에 들어간다.
3. `Silver Dataset 생성`을 누른다.
4. Source Dataset 하나를 선택하고 rules/review를 거쳐 저장한다.
5. Gold wizard `Silver 선택` 단계로 복귀하고 새 Silver가 선택됐는지 확인한다.
