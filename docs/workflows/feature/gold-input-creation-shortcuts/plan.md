# Gold input creation shortcuts 계획

## 목표

C31/C32 이후 남은 clean-room demo risk 중 하나를 줄인다. 사용자가 Gold Dataset을 만들다가 입력 Silver Dataset이 부족하거나 새 raw/source부터 다시 만들고 싶을 때 막히지 않고 Source/Silver 생성 wizard로 이동할 수 있게 한다.

## 범위

- Gold Dataset wizard의 `Silver 선택` 단계에 `Source Dataset 생성`, `Silver Dataset 생성` CTA를 추가한다.
- 기존 Source/Silver wizard를 재사용한다.
- 기존 보조 Source picker modal의 `Source Dataset 생성` CTA도 dead-end notice 대신 실제 Source wizard로 연결한다.

## 제외 범위

- Source/Silver/Gold 자동 생성.
- 대용량 ETL runner 추가.
- query/AI 추천 기반 recipe 생성.
- clean-room 전체 데이터 생성 E2E 완료 선언.

## Acceptance Criteria

- Gold Dataset 생성에서 `Silver 선택` 단계로 이동하면 Source/Silver 생성 CTA가 보인다.
- `Source Dataset 생성`을 누르면 `Create Source Dataset` wizard가 열린다.
- `Silver Dataset 생성`을 누르면 `Create Silver Dataset` wizard가 열린다.
- console error가 없다.

## Regression / Failure Scenario

- Gold wizard의 기존 next/back/save flow가 깨지면 실패다.
- CTA가 단순 알림만 띄우고 실제 생성 화면으로 가지 않으면 실패다.
- Source/Silver 생성 후 목록으로 복귀하는 기존 동작을 바꾸면 실패다.

## Manual Verification

1. `/datasets/gold`로 이동한다.
2. `Gold Dataset 생성`을 누른다.
3. `다음`을 눌러 `Silver 선택`으로 이동한다.
4. `Source Dataset 생성`, `Silver Dataset 생성` CTA가 보이는지 확인한다.
5. 각 CTA가 해당 wizard로 전환되는지 확인한다.
