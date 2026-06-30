# MongoDB Source Dataset seed 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: local smoke complete
- Summary: Docker MongoDB에 demo event 500 rows를 적재했고, AskLake API에서 MongoDB External Connection과 Source Dataset metadata 저장을 확인했다.

## Recommended Next Action / 권장 다음 행동

- 후속 Phase에서 MongoDB Source Dataset을 Target Dataset run 또는 Product Health `behavior` source role에 연결할지 결정한다.
- Reason: 이번 Phase는 Source Dataset metadata까지만 닫았고, run/catalog/query 연결은 별도 검증 범위다.

## Options / 선택지

1. MongoDB Source Dataset을 Target Dataset 입력으로 연결하는 다음 Phase를 시작한다.
2. 현재 MongoDB smoke를 브라우저 UI에서 한 번 더 확인한다.
3. 현재 변경을 PR-ready로 정리할지, 기존 `feature/llm-runtime-settings-ui` 작업과 분리할지 결정한다.
4. 여기서 멈추고 Docker MongoDB만 로컬 검증 상태로 유지한다.

## Waiting On Human / 사람 응답 대기

- 다음 Phase 또는 PR 정리 방식 선택.

## Last User Choice / 마지막 사용자 선택

- 사용자가 MongoDB 실제 연결과 기존 데이터 일부 적재를 요청함.

## Next AI Action / 다음 AI 행동

- option 1이면 Target Dataset/Run 범위를 별도 Phase로 연다.
- option 2이면 browser skill 또는 직접 UI smoke로 `/dataset` 흐름을 확인한다.
- option 3이면 포함/제외 파일을 분리해 stage/PR 준비 여부를 보고한다.
- option 4이면 현재 Docker 상태와 재개 명령만 유지한다.
