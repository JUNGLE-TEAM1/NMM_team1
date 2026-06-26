# Week2 contract lock 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: pushed to main
- Summary: 추천안 기준 Week2 계약 commit이 최신 `origin/main` 위로 rebase된 뒤 remote main에 반영됐다.

## Recommended Next Action / 권장 다음 행동

- 후속 구현 branch에서 M2/M3/M5 병렬 구현을 시작한다.
- Reason: 계약 fixture와 Source of Truth가 main에 올라갔고, 구현자가 따라야 할 입력/반환 형식이 잠겼다.

## Options / 선택지

1. M2 `RuntimeConfig`/SparkRunner smoke 시작.
2. M3 `TransformSpec`/JSON profile 구현 시작.
3. M5 runner selection/Catalog guard 구현 시작.

## Waiting On Human / 사람 응답 대기

- 없음.

## Last User Choice / 마지막 사용자 선택

- "추천안으로 잠그고, 계약 결과를 main에 올려주세요."

## Next AI Action / 다음 AI 행동

- 후속 구현 요청이 오면 `contracts/*.sample.json`과 `docs/03`을 첫 컨텍스트로 사용한다.
