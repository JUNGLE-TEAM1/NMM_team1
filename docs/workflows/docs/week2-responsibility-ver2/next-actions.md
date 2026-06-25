# Week2 responsibility ver2 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: ver2 책임 분리 기준 문서와 workspace evidence 작성이 완료되었다.

## Recommended Next Action / 권장 다음 행동

- PR-ready 상태를 확인하고 PR 생성 여부를 선택한다.
- Reason: docs-only 기준 정리와 하네스 검증이 완료되었고, runtime 구현은 후속 Phase로 분리했다.

## Options / 선택지

1. PR 준비: 검증 통과 후 PR 생성
2. 추가 보강: ver2 문서에 예시 계약 또는 통합 diagram 추가
3. 보류: 팀 합의 전 local branch로 유지
4. 후속 구현 Phase 시작: M2 RuntimeConfig/SparkRunner 또는 M3 JSON main path

## Phase Queue / 병렬 구현 전 순서

| Phase | Workspace 후보 | 목적 |
| --- | --- | --- |
| 1 | `docs/week2-responsibility-ver2` | 현재 책임 기준 ver2 고정 |
| 2 | `docs/week2-implementation-transition` | 기존 구현 위 전환 계획 작성 |
| 3 | `docs/week2-main-e2e-path` | 발표 main E2E path 확정 |
| 4 | `docs/week2-existing-implementation-anchor` | 유지할 기존 구현과 흡수 방식 확정 |
| 5 | `docs/week2-m3-json-main-path-decision` | M3 JSON main path와 PR #105 회수 여부 결정 |
| 6 | `docs/week2-runner-boundary-decision` | M2/M3/M5 runner boundary 확정 |

## Waiting On Human / 사람 응답 대기

- 사람 선택 대기.

## Last User Choice / 마지막 사용자 선택

- 사용자가 ver2 문서화를 지시함.

## Next AI Action / 다음 AI 행동

- option 1이면 PR 준비를 진행한다.
- option 2이면 `ver2/` 문서와 workspace evidence를 보강한다.
- option 3이면 branch를 유지하고 `notes.md`에 보류 이유를 기록한다.
- option 4이면 새 구현 workspace를 별도로 시작한다.
