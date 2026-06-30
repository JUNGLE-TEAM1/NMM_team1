# Source Silver Gold chain smoke 계획

## 목표

C34에서 구현한 return flow를 한 단계 더 길게 검증한다. Gold wizard에서 Source 생성 shortcut으로 들어가 새 Source Dataset을 저장하고, 그 Source로 Silver Dataset을 저장한 뒤 Gold 입력 선택으로 돌아오는 clean-room chain을 브라우저에서 확인한다.

## 범위

- Gold wizard `Silver 선택` 단계에서 `Source Dataset 생성`으로 이동한다.
- local file External Connection을 선택해 Source Dataset metadata를 저장한다.
- Source 저장 후 Silver rules 단계로 이어지는지 확인한다.
- Silver Dataset metadata를 저장한다.
- Silver 저장 후 Gold wizard `Silver 선택` 단계로 복귀하고 새 Silver가 자동 선택되는지 확인한다.

## 제외 범위

- Gold Dataset 저장.
- Gold Build Run 실행.
- Catalog publish.
- AI Query까지의 full clean-room E2E.
- backend/API/schema 변경.

## Acceptance Criteria

- 새 Source Dataset metadata가 저장된다.
- Source 저장 후 Silver rules 단계로 자동 이동한다.
- 새 Silver Dataset metadata가 저장된다.
- Silver 저장 후 Gold wizard `Silver 선택` 단계로 돌아온다.
- 새 Silver가 selected/base silver로 표시된다.
- console error가 없다.

## Regression / Failure Scenario

- Source 저장 후 목록으로 빠져 Silver 생성으로 이어지지 않으면 실패다.
- Silver 저장 후 Gold 입력으로 돌아오지 않으면 실패다.
- 저장되지 않은 dataset이 selected처럼 보이면 실패다.

## Manual Verification

1. `/datasets/gold`로 이동한다.
2. `Gold Dataset 생성 -> 다음 -> Source Dataset 생성`.
3. local file External Connection을 선택한다.
4. Source Dataset 이름을 고유하게 바꾸고 저장한다.
5. Silver rules/review로 이어진 뒤 Silver를 저장한다.
6. Gold wizard `Silver 선택` 복귀와 selected/base silver 표시를 확인한다.
