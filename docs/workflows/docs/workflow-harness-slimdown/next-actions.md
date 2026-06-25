# Workflow harness slimdown 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: ready-for-review
- Summary: `docs/08-development-workflow.md` 중복 설명을 canonical 문서 참조로 압축했고, local harness validation을 완료했다.

## Recommended Next Action / 권장 다음 행동

- 기존 dirty hotfix workspace 변경과 분리해 PR/branch 정리 여부를 결정한다.
- Reason: 현재 작업은 `--no-checkout --no-issue` workspace에서 수행되어 별도 branch 전환/PR 준비가 아직 되지 않았다.

## Options / 선택지

1. 별도 branch로 정리해 PR-ready 경로를 준비한다.
2. 현재 local 변경으로 보류하고 재개 조건을 남긴다.
3. 추가로 `docs/13` 또는 `docs/10`까지 2차 다이어트를 별도 Phase로 잡는다.
4. 기존 hotfix workspace 변경을 먼저 마무리한 뒤 이 작업을 이어간다.

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

- 

## Next AI Action / 다음 AI 행동

- option 1이면 dirty 상태를 다시 보고하고 branch switch/checkpoint 확인 후 PR 준비를 진행한다.
- option 2이면 `sync.md`와 `next-actions.md`에 hold reason을 유지한다.
- option 3이면 새 Phase 후보를 만든다.
- option 4이면 기존 hotfix workspace 상태를 우선 확인한다.
